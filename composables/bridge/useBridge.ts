/* eslint-disable max-depth */
import {
  reactive,
  ref,
  Ref,
  onMounted,
  onBeforeUnmount,
  computed,
} from '@nuxtjs/composition-api'
import { hexDataLength } from '@ethersproject/bytes'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { JsonRpcSigner } from '@ethersproject/providers/lib/json-rpc-provider'
import { ethers, BigNumber } from 'ethers'
import { Bridge } from 'arb-ts'
import { useWeb3 } from '@instadapp/vue-web3'
import axios from 'axios'
import { useNetwork, activeNetwork } from '../web3/useNetwork'
import { useBigNumber } from '../web3/useBigNumber'
import { useNotification } from '~/composables/useNotification'
import realmsLockBoxABI from '~/abi/realmsLockBox.json'
import lootRealmsABI from '~/abi/lootRealms.json'
import lootRealmsL2ABI from '~/abi/lootRealmsL2.json'
import erc721Tokens from '~/constant/erc721Tokens'
import { useRealms } from '~/composables/web3/useRealms'
import {
  useTransactions,
  AssetType,
  Transaction,
} from '~/composables/bridge/useTransactions'
const RINKEBY_L1_BRIDGE_ADDRESS = '0x2a8Bd12936BD5fC260314a80D51937E497523FCC'
const ARB_RINKEBY_L2_BRIDGE_ADDRESS =
  '0x5fAe6B0BE396B9541D5Cc8D50a98168b790d0d7e'
interface AppProps {
  bridge: Bridge
}
export type TxnType =
  | 'deposit'
  | 'deposit-l1'
  | 'deposit-l2'
  | 'withdraw'
  | 'outbox'
  | 'approve'
  | 'connext-deposit'
  | 'connext-withdraw'
  | 'deposit-l2-auto-redeem'
  | 'deposit-l2-ticket-created'

export const txnTypeToLayer = (txnType: TxnType): 1 | 2 => {
  switch (txnType) {
    case 'deposit':
    case 'deposit-l1':
    case 'outbox':
    case 'approve':
    case 'connext-deposit':
      return 1
    case 'deposit-l2':
    case 'withdraw':
    case 'connext-withdraw':
    case 'deposit-l2-auto-redeem':
    case 'deposit-l2-ticket-created':
      return 2
  }
}

const selectedRealm = ref()

export function useBridge() {
  const { showError } = useNotification()
  const { getWalletRealms } = useRealms()
  const loadingBridge = ref(false)
  const error = reactive({
    depositL1: null,
    withdrawL2: null,
  })

  const loading = reactive({
    depositL1: null,
    withdrawL2: null,
  })
  const result = reactive({
    realmsOnL2: null,
  })

  const { times, plus, ensureValue } = useBigNumber()
  const { provider, library, account, activate } = useWeb3()
  const { partnerNetwork, useL1Network, useL2Network } = useNetwork()
  const {
    successfulL1Deposits,
    sortedTransactions,
    addTransaction,
    addTransactions,
    updateTransaction,
    pendingWithdrawalsMap,
    pendingTransactions,
    setTransactionConfirmed,
    addToExecutedMessagesCache,
    setTransactionFailure,
    getOutGoingMessageState,
  } = useTransactions()

  const ethProvider = ref(null)
  const arbProvider = ref(null)
  const l1Signer = ref(null)
  const l2Signer = ref(null)
  const l2TransactionCount = ref(null)
  const bridge = ref(null)

  const getSelectedRealm = computed(() => selectedRealm.value)
  const loadingMeta = ref(false)
  const selectRealmForTransfer = async (realm) => {
    loadingMeta.value = true
    try {
      const response = await fetchRealmMetaData(realm.id)
      selectedRealm.value = response.data
    } catch (e) {
      console.log(e)
    } finally {
      loadingMeta.value = false
    }
  }

  const fetchRealmMetaData = async (id) => {
    try {
      return await axios.get(
        'https://api.opensea.io/api/v1/asset/0x7afe30cb3e53dba6801aa0ea647a0ecea7cbe18d/' +
          id
      )
    } catch (e) {
      console.log(e)
    }
  }

  const getL1Signer = async () => {
    if (activeNetwork.value.isArbitrum) {
      const ethProvider = new ethers.providers.JsonRpcProvider(
        useL1Network.value.url
      )
      return ethProvider.getSigner(account.value)
    }
    return (await library.value?.getSigner(account.value)) as JsonRpcSigner
  }

  const getL2Signer = async () => {
    if (activeNetwork.value.isArbitrum) {
      return (await library.value?.getSigner(account.value)) as JsonRpcSigner
    }
    const arbProvider = new ethers.providers.JsonRpcProvider(
      useL2Network.value.url
    )
    return arbProvider.getSigner(account.value)
  }

  const currentL1BlockNumber = ref(0)

  const initBridge = async () => {
    try {
      bridge.value = await Bridge.init(await getL1Signer(), await getL2Signer())
      l2TransactionCount.value =
        await bridge.value.l2Signer.getTransactionCount()
      bridge.value.l1Provider.on('block', (blockNumber) => {
        console.log('received block event' + blockNumber)
        currentL1BlockNumber.value = blockNumber
      })
      return bridge.value
    } catch (e) {
      console.log(e)
    }
  }

  const depositRealm = async (id) => {
    // eslint-disable-next-line prefer-const
    if (!process.server) {
      loadingBridge.value = true
      loading.depositL1 = true
      try {
        // Calculate the amount of data to be sent to L2 (see LootRealmsLockbox)
        const calldataBytes = ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256'],
          [bridge.value.l1Bridge.l1Signer._address, 1011]
        )
        const calldataBytesLength = hexDataLength(calldataBytes) + 4 // 4 bytes func identifier
        console.log(`Calldata size: ${calldataBytesLength}`)
        console.log('deposting id' + id)
        const [_submissionPriceWei, nextUpdateTimestamp] =
          await bridge.value.l2Bridge.getTxnSubmissionPrice(calldataBytesLength)
        const submissionPriceWei = _submissionPriceWei + 5
        const timeNow = Math.floor(new Date().getTime() / 1000)
        const gasPriceBid = await bridge.value.l2Provider.getGasPrice()
        console.log(submissionPriceWei)
        console.log(`L2 gas price: ${gasPriceBid.toString()}`)

        // Hardcoded for now
        const maxGas = 200000000
        // eslint-disable-next-line prettier/prettier
      const callValue = (gasPriceBid * maxGas) + parseInt(submissionPriceWei)
        console.log(`Call value to L2: ${callValue.toString()}`)

        const lootRealmsLockbox = new ethers.Contract(
          RINKEBY_L1_BRIDGE_ADDRESS,
          realmsLockBoxABI,
          await getL1Signer()
        )
        const realmsAddress =
          erc721Tokens[activeNetwork.value.id].realms.address

        const realmsContract = new ethers.Contract(
          realmsAddress,
          lootRealmsABI,
          await getL1Signer()
        )

        const checkApproval = await realmsContract.isApprovedForAll(
          account.value,
          RINKEBY_L1_BRIDGE_ADDRESS
        )
        console.log(checkApproval)

        const network = await bridge.value.l1Bridge.l1Provider.getNetwork()
        const networkID = await network.chainId

        if (!checkApproval) {
          const tx = await realmsContract.setApprovalForAll(
            RINKEBY_L1_BRIDGE_ADDRESS,
            true
          )
          addTransaction({
            type: 'approve',
            status: 'pending',
            value: null,
            txID: tx.hash,
            assetName: 'Realms',
            assetType: AssetType.ERC721,
            sender: account.value,
            l1NetworkID: networkID, // TODO: make dynamiuc
          })
          const receipt = await tx.wait()
          updateTransaction(receipt, tx)
        }

        const tx = await lootRealmsLockbox.depositToL2(
          id,
          submissionPriceWei,
          maxGas,
          gasPriceBid,
          { value: callValue }
        )

        addTransaction({
          type: 'deposit-l1',
          status: 'pending',
          value: id,
          txID: tx.hash,
          assetName: 'Realms',
          assetType: AssetType.ERC721,
          sender: account.value,
          l1NetworkID: networkID,
        })

        try {
          const receipt = await tx.wait()
          const seqNums =
            await bridge.value.getInboxSeqNumFromContractTransaction(receipt)
          const seqNum = seqNums[0].toNumber()
          updateTransaction(receipt, tx, seqNum)
          loading.depositL1 = false
        } catch (err) {
          console.warn('deposit token failure', err)
          throw err
        }
      } catch (e) {
        await showError(e.message)
        console.log(e)
      } finally {
        loadingBridge.value = false
        loading.depositL1 = false
      }
    }
  }

  const withdrawToL1 = async (id) => {
    // eslint-disable-next-line prefer-const
    if (!process.server) {
      loadingBridge.value = true
      // Calculate the amount of data to be sent to L2 (see LootRealmsLockbox)
      const lootRealmsL2 = new ethers.Contract(
        ARB_RINKEBY_L2_BRIDGE_ADDRESS,
        lootRealmsL2ABI,
        await getL2Signer()
      )
      console.log(lootRealmsL2)

      const checkApproval = await lootRealmsL2.isApprovedForAll(
        account.value,
        ARB_RINKEBY_L2_BRIDGE_ADDRESS
      )
      console.log(checkApproval)
      if (!checkApproval) {
        console.log('approving')
        const approve = await lootRealmsL2.setApprovalForAll(
          ARB_RINKEBY_L2_BRIDGE_ADDRESS,
          true
        )
        await approve.wait()
      }

      const tx = await lootRealmsL2.withdrawToL1(id)

      const realmsAddress = erc721Tokens[activeNetwork.value.id].realms.address

      try {
        addTransaction({
          type: 'withdraw',
          status: 'pending',
          value: id,
          txID: tx.hash,
          assetName: 'Realms',
          assetType: AssetType.ERC721,
          sender: account.value,
          blockNumber: tx.blockNumber || 0, // TODO: ensure by fetching blocknumber?,
          l1NetworkID: useL1Network.value.chainId,
        })
        const receipt = await tx.wait()
        updateTransaction(receipt, tx)

        const l2ToL2EventData =
          await bridge.value.getWithdrawalsInL2Transaction(receipt)
        console.log('l1 to l2event data')
        console.log(l2ToL2EventData)
        if (l2ToL2EventData.length === 1) {
          const l2ToL2EventDataResult = l2ToL2EventData[0]
          const id = l2ToL2EventDataResult.uniqueId.toString()
          const outgoingMessageState = await getOutGoingMessageState(
            bridge,
            l2ToL2EventDataResult.batchNumber,
            l2ToL2EventDataResult.indexInBatch
          )
          const l2ToL2EventDataResultPlus = {
            ...l2ToL2EventDataResult,
            type: AssetType.ERC721,
            tokenAddress: realmsAddress,
            value: id,
            outgoingMessageState,
          }
          pendingWithdrawalsMap.value = {
            ...pendingWithdrawalsMap.value,
            [id]: l2ToL2EventDataResultPlus,
          }
        }
        return receipt
      } catch (err) {
        console.warn('withdraw token err', err)
      }
    }
  }

  const triggerOutbox = async (pendingWithdrawalsMapSent, id: string) => {
    console.log(pendingWithdrawalsMapSent.value)
    if (!pendingWithdrawalsMapSent.value[id])
      throw new Error('Outbox message not found')
    const { batchNumber, indexInBatch, tokenAddress, value } =
      pendingWithdrawalsMapSent.value[id]
    const res = await bridge.value.triggerL2ToL1Transaction(
      batchNumber,
      indexInBatch,
      true
    )
    addTransaction({
      status: 'pending',
      type: 'outbox',
      value: null,
      assetName: 'Realms',
      assetType: AssetType.ERC721,
      sender: account.value,
      txID: res.hash,
      l1NetworkID: useL1Network.value.chainId,
    })
    try {
      const rec = await res.wait()
      if (rec.status === 1) {
        setTransactionConfirmed(rec.transactionHash)
        const newPendingWithdrawalsMap = { ...pendingWithdrawalsMap.value }
        delete newPendingWithdrawalsMap[id]
        pendingWithdrawalsMap.value = newPendingWithdrawalsMap
        addToExecutedMessagesCache(batchNumber, indexInBatch)
        await getWalletRealms()
      } else {
        setTransactionFailure(rec.transactionHash)
      }
      return rec
    } catch (err) {
      console.warn('WARNING: token outbox execute failed:', err)
    }
  }

  const getL2TxnHashes = async (depositTxn) => {
    let seqNum: BigNumber
    if (depositTxn.seqNum) {
      seqNum = BigNumber.from(depositTxn.seqNum)
    } else {
      // for backwards compatibility, add seqNum to cached old deposits
      const rec = await bridge.value.l1Provider.getTransactionReceipt(
        depositTxn.txID
      )
      const seqNumArray =
        await bridge.value.getInboxSeqNumFromContractTransaction(rec)
      if (!seqNumArray || seqNumArray.length === 0) {
        return null
      }
      ;[seqNum] = seqNumArray
    }

    const l2ChainID = BigNumber.from(useL2Network.value.chainId)
    const retryableTicketHash = await bridge.value.calculateL2TransactionHash(
      seqNum,
      l2ChainID
    )
    const autoRedeemHash =
      await bridge.value.calculateRetryableAutoRedeemTxnHash(seqNum, l2ChainID)
    const userTxnHash = await bridge.value.calculateL2RetryableTransactionHash(
      seqNum,
      l2ChainID
    )
    return {
      retryableTicketHash,
      autoRedeemHash,
      userTxnHash,
      seqNum,
    }
  }
  const checkAndAddL2DepositTxns = () => {
    Promise.all(successfulL1Deposits.value.map(getL2TxnHashes))
      .then((txnHashesArr) => {
        let transactionsToAdd = []
        const txIdsSet = new Set([
          ...sortedTransactions.value.map((tx) => tx.txID),
        ])
        successfulL1Deposits.value.forEach((depositTxn, i: number) => {
          const txnHashes = txnHashesArr[i]
          if (txnHashes === null) {
            console.log('Could not find seqNum for', depositTxn.txID)
            return
          }
          const { retryableTicketHash, autoRedeemHash, userTxnHash } = txnHashes
          const seqNum = txnHashes.seqNum.toNumber()
          // add ticket creation if not yet included
          if (!txIdsSet.has(retryableTicketHash)) {
            transactionsToAdd.push({
              ...depositTxn,
              ...{
                status: 'pending',
                type:
                  depositTxn.assetType === 'ETH'
                    ? 'deposit-l2'
                    : 'deposit-l2-ticket-created',
                txID: retryableTicketHash,
                seqNum,
                blockNumber: undefined,
              },
            })
          }

          if (depositTxn.assetType === AssetType.ERC721) {
            // add autoredeem if not yet included (tokens only)
            if (!txIdsSet.has(autoRedeemHash)) {
              transactionsToAdd.push({
                ...depositTxn,
                ...{
                  status: 'pending',
                  type: 'deposit-l2-auto-redeem',
                  txID: autoRedeemHash,
                  seqNum,
                  blockNumber: undefined,
                },
              })
            }
            // add user-txn if not yet included (tokens only)
            if (!txIdsSet.has(userTxnHash)) {
              transactionsToAdd.push({
                ...depositTxn,
                ...{
                  status: 'pending',
                  type: 'deposit-l2',
                  txID: userTxnHash,
                  seqNum,
                  blockNumber: undefined,
                },
              })
            }
          }
        })
        addTransactions(transactionsToAdd)
        transactionsToAdd = []
      })
      .catch((err) => {
        console.warn('Errors checking to retryable txns to add', err)
      })
  }
  const checkAndUpdatePendingTransactions = () => {
    if (pendingTransactions.value.length) {
      console.info(
        `Checking and updating ${pendingTransactions.value.length} pending transactions' statuses`
      )

      // eslint-disable-next-line consistent-return
      return Promise.all(
        pendingTransactions.value.map((tx: Transaction) => {
          const provider =
            txnTypeToLayer(tx.type) === 2
              ? bridge?.value.l2Provider
              : bridge?.value.l1Provider
          return provider?.getTransactionReceipt(tx.txID)
        })
      ).then((txReceipts: TransactionReceipt[]) => {
        txReceipts.forEach(async (txReceipt: TransactionReceipt, i) => {
          if (!txReceipt) {
            console.info(
              'Transaction receipt not yet found:',
              pendingTransactions.value[i].txID
            )
          } else {
            updateTransaction(txReceipt)
            await getWalletRealms()
          }
        })
      })
    }
  }
  const getL2Realms = async () => {
    console.log('getting l2 realms')
    const l2RealmsContract = new ethers.Contract(
      ARB_RINKEBY_L2_BRIDGE_ADDRESS,
      lootRealmsL2ABI,
      l2Signer.value
    )
    const connect = await l2RealmsContract.connect(arbProvider.value)
    // console.log(connect)
    result.realmsOnL2 = await connect.balanceOf(account.value)
    // console.log(balance)
    return result.realmsOnL2
  }

  return {
    initBridge,
    getL2Realms,
    depositRealm,
    withdrawToL1,
    getL2TxnHashes,
    l2TransactionCount,
    triggerOutbox,
    currentL1BlockNumber,
    error,
    bridge,
    result,
    loading,
    partnerNetwork,
    loadingBridge,
    selectRealmForTransfer,
    getSelectedRealm,
  }
}
