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
import { useNetwork, activeNetwork } from './useNetwork'
import { useGraph } from './useGraph'
import { useBigNumber } from './useBigNumber'
import { mintedRealmsQuery } from './../graphql/queries'
import { useRealms } from './useRealms'
import { useWeb3 } from './'
import atimeABI from '~/abi/atime.json'
import erc20Tokens from '~/constant/erc20Tokens'
import { useWeb3Modal } from '~/composables/web3/useWeb3Modal'

const result = reactive({ claim: null })

const availableTokenIds = ref(null)

export function useAtime() {
  const loading = reactive({
    claim: false,
    getAvailableTokenIds: false,
  })
  const error = reactive({
    claim: null,
    getAvailableTokenIds: null,
  })

  const loadingModal = ref(false)
  const { times, plus, ensureValue } = useBigNumber()
  const { provider, account, activate } = useWeb3()
  const { open } = useWeb3Modal()
  const { gqlRequest } = useGraph()
  const { userRealms, getWalletRealms } = useRealms()

  const flatObject = (arr) => {
    const flatArray = []
    for (let i = 0; i < arr.length; i++) {
      flatArray[i] = parseInt(arr[i].id)
    }
    return flatArray
  }

  const checkAtimeRealmIdMinted = async () => {
    console.log('checking if realm minted atims')
    await getWalletRealms()
    if (userRealms.value.l1) {
      const symbols = userRealms.value.l1.filter(
        (realm) => realm.atimeClaime === false
      )
    }
    return [{ id: 1 }, { id: 2 }]
  }

  const claimById = async (realmId) => {
    if (!account.value) return open()
    try {
      error.claim = null
      loading.claim = true
      loadingModal.value = true
      result.claim = await claimAtimeById(
        account.value,
        activeNetwork.value.id,
        realmId
      )
    } catch (e) {
      error.claim = e.message
    } finally {
      loading.claim = false
      await getAvailableTokenIds()
    }
  }

  const claimAllForOwner = async () => {
    if (!account.value) return open()

    try {
      error.claim = null
      loadingModal.value = true
      loading.claim = true
      result.claim = await claimAllAtimeForOwner(
        account.value,
        activeNetwork.value.id
      )
    } catch (e) {
      error.claim = e.message
    } finally {
      loading.claim = false
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
      console.log('getting abailable')
      loading.getAvailableTokenIds = true
      error.getAvailableTokenIds = null
      availableTokenIds.value = await checkAtimeRealmIdMinted()
    } catch (e) {
      error.getAvailableTokenIds = e.message
    } finally {
      loading.getAvailableTokenIds = false
    }
    return availableTokenIds.value
  }

  return {
    claimById,
    claimAllForOwner,
    error,
    result,
    loading,
    loadingModal,
    checkAtimeRealmIdMinted,
    availableTokenIds,
    getAvailableTokenIds,
  }
}

async function claimAtimeById(owner, network, lootId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const atimeAddress = erc20Tokens[network].getTokenByKey('atime').address
  const signer = provider.getSigner()

  const tokenContract = new ethers.Contract(atimeAddress, atimeABI, signer)

  const mint = await tokenContract.claimById(lootId)
  await mint.wait()

  return mint
}

async function claimAllAtimeForOwner(owner, network) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const atimeAddress = erc20Tokens[network].getTokenByKey('atime').address
  const signer = provider.getSigner()

  const tokenContract = new ethers.Contract(atimeAddress, atimeABI, signer)

  const mint = await tokenContract.claimAllForOwner()
  await mint.wait()

  return mint
}
