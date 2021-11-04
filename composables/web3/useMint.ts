/* eslint-disable max-depth */
import {
  computed,
  reactive,
  onMounted,
  useContext,
  ref,
  watch,
} from '@nuxtjs/composition-api'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useWeb3 } from '@instadapp/vue-web3'
import { useNetwork, activeNetwork } from './useNetwork'
import { useGraph } from './useGraph'
import { useBigNumber } from './useBigNumber'
import { mintedRealmsQuery } from './../graphql/queries'
import { useWeb3Modal } from '~/composables/web3/useWeb3Modal'
import realmsABI from '~/abi/lootRealms.json'
import erc721tokens from '~/constant/erc721Tokens'

const result = reactive({ mint: null })

const availableTokenIds = ref(null)

export function useMint() {
  const loading = reactive({
    mint: false,
    getAvailableTokenIds: false,
  })
  const error = reactive({
    mint: null,
    getAvailableTokenIds: null,
  })

  const loadingModal = ref(false)
  const { times, plus, ensureValue } = useBigNumber()
  const { provider, account, activate } = useWeb3()
  const { open } = useWeb3Modal()
  const { gqlRequest } = useGraph()
  const mintedRealmIds = ref([])

  const flatObject = (arr) => {
    const flatArray = []
    for (let i = 0; i < arr.length; i++) {
      flatArray[i] = parseInt(arr[i].id)
    }
    return flatArray
  }

  const checkTokenMint = async () => {
    let lastFetchedId = '0'
    let mintedRealms = []
    for (let i = 0; i < 8; i++) {
      try {
        const { realms } = await gqlRequest(
          mintedRealmsQuery,
          { lastID: lastFetchedId },
          activeNetwork.value.id
        )
        lastFetchedId = realms[realms.length - 1].id
        mintedRealms = [...mintedRealms, ...realms]
      } catch (e) {
        console.log('all fetched')
        break
      }
    }
    return flatObject(mintedRealms).sort(function (a, b) {
      return a - b
    })
  }

  const mint = async (lootId) => {
    if (!account.value) return open()
    try {
      error.mint = null
      loading.mint = true
      loadingModal.value = true
      result.mint = await mintToken(
        account.value,
        activeNetwork.value.id,
        lootId
      )
    } catch (e) {
      error.mint = e.message
    } finally {
      loading.mint = false
      await getAvailableTokenIds()
    }
  }

  const multiMint = async (lootIds) => {
    if (!account.value) return open()

    try {
      error.mint = null
      loadingModal.value = true
      loading.mint = true
      result.mint = await multiMintToken(
        account.value,
        activeNetwork.value.id,
        lootIds
      )
    } catch (e) {
      error.mint = e.data.message
    } finally {
      loading.mint = false
      await getAvailableTokenIds()
    }
  }
  const findMissing = (num) => {
    const max = Math.max(...num) // Will find highest number
    const min = Math.min(...num) // Will find lowest number
    const missing = []

    for (let i = min; i <= max; i++) {
      if (!num.includes(i)) {
        // Checking whether i(current value) present in num(argument)
        missing.push(i) // Adding numbers which are not in num(argument) array
      }
    }
    return missing
  }

  const getAvailableTokenIds = async () => {
    try {
      loading.getAvailableTokenIds = true
      error.getAvailableTokenIds = null
      const mintedTokens = await checkTokenMint()
      availableTokenIds.value = findMissing(mintedTokens)
    } catch (e) {
      error.getAvailableTokenIds = e.message
    } finally {
      loading.getAvailableTokenIds = false
    }
    return availableTokenIds.value
  }

  return {
    mint,
    multiMint,
    error,
    result,
    loading,
    loadingModal,
    mintedRealmIds,
    availableTokenIds,
    getAvailableTokenIds,
  }
}

async function mintToken(owner, network, lootId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const realmsAddress = erc721tokens[network].realms.address
  const signer = provider.getSigner()

  const tokenContract = new ethers.Contract(realmsAddress, realmsABI, signer)
  const overrides = {
    // To convert Ether to Wei:
    value: ethers.utils.parseEther('0.1'),
  }
  const mint = await tokenContract.mint(lootId, overrides)
  await mint.wait()

  return mint
}

async function multiMintToken(owner, network, lootIds) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const realmsAddress = erc721tokens[network].realms.address
  const signer = provider.getSigner()

  const tokenContract = new ethers.Contract(realmsAddress, realmsABI, signer)

  const wei =
    network === 'rinkeby' ? 0.0 * lootIds.length : 0.1 * lootIds.length
  const overrides = {
    // To convert Ether to Wei:
    value: ethers.utils.parseEther(wei.toString()),
  }
  const mint = await tokenContract.multiMint(lootIds, overrides)
  await mint.wait()

  return mint
}
