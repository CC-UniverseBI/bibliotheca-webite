import { reactive, ref, Ref } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { useNetwork, activeNetwork } from '../web3/useNetwork'
import { useWeb3 } from '../web3'
import { ageDistributions } from '../lordsTokenDistribution'
// ABI
import { useNotification } from '~/composables/useNotification'
import ResourceConstructionFacetAbi from '~/abi/ResourceConstructionFacet.json'
import LordsClaimingFacetAbi from '~/abi/LordsClaimingFacet.json'
import LordsTokenAbi from '~/abi/TheLordsToken.json'
import SRealmTokenAbi from '~/abi/SRealmToken.json'
import StakingFacetAbi from '~/abi/StakingFacet.json'
// ADDRESS CONSTS
import erc1155Tokens from '~/constant/erc1155Tokens'
import contractAddress from '~/constant/contractAddress'
import erc20Tokens from '~/constant/erc20Tokens'
import erc721Tokens from '~/constant/erc721Tokens'

import GoldAbi from '~/abi/gold.json'
export function useLords() {
  const { provider, library, account, activate } = useWeb3()
  const { partnerNetwork, useL1Network, useL2Network } = useNetwork()
  const { showError } = useNotification()
  const error = reactive({
    lords: null,
  })

  const loading = reactive({
    lords: false,
    claim: false,
  })

  const result = reactive({ resources: null })
  const output = ref()

  const lordsAvailableOnRealm = ref()

  const claimLords = async (realmId) => {
    try {
      error.lords = null
      loading.claim = true
      lordsAvailableOnRealm.value = await claimAllLords(
        account,
        activeNetwork.value.id,
        realmId
      )
    } catch (e) {
      await showError(e.data.message)
    } finally {
      loading.claim = false
    }
  }
  const worldAge = ref()
  const getWorldAge = async (realmId) => {
    try {
      error.lords = null
      loading.lords = true
      worldAge.value = await getAge(account, activeNetwork.value.id, realmId)
    } catch (e) {
      if (e.data) {
        await showError(e.data.message)
      }
    } finally {
      loading.lords = false
    }
  }
  const lordsBalance = ref()
  const getAdventurersLords = async (account) => {
    try {
      error.lords = null
      loading.lords = true
      lordsBalance.value = await getLordsBalance(
        account,
        activeNetwork.value.id
      )
    } catch (e) {
      await showError(e.data.message)
    } finally {
      loading.lords = false
    }
  }
  const goldBalance = ref()
  const getAdventurersGold = async (account) => {
    try {
      error.lords = null
      loading.lords = true
      goldBalance.value = await getGoldBalance(account, activeNetwork.value.id)
    } catch (e) {
      console.log(e)
      error.lords = e.data.message
    } finally {
      loading.lords = false
    }
  }

  const timeNextAge = ref()
  const getTimeToNextAge = async (account) => {
    try {
      error.lords = null
      loading.lords = true
      timeNextAge.value = await timeToNextAge(activeNetwork.value.id)
    } catch (e) {
      console.log(e)
      error.lords = e.data?.message
    } finally {
      loading.lords = false
    }
  }
  return {
    claimLords,
    getWorldAge,
    getAdventurersLords,
    goldBalance,
    getAdventurersGold,
    lordsBalance,
    worldAge,
    lordsAvailableOnRealm,
    getTimeToNextAge,
    timeNextAge,
    error,
    loading,
    result,
    output,
  }
}

async function claimAllLords(owner, network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const lordsTokensFacetAddress = contractAddress[network].realmsDiamond

  const lordsTokens = new ethers.Contract(
    lordsTokensFacetAddress,
    LordsClaimingFacetAbi.abi,
    signer
  )
  const lords = await lordsTokens.claimAllLords()
  await lords
  return lords
}

async function getAge(owner, network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const lordsTokensFacetAddress = contractAddress[network].realmsDiamond

  const lordsTokens = new ethers.Contract(
    lordsTokensFacetAddress,
    LordsClaimingFacetAbi.abi,
    signer
  )
  const lords = await lordsTokens.getAge()
  await lords
  return lords
}

async function getLordsBalance(owner, network) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const lordsTokensAddress = erc20Tokens[network].getTokenByKey('lords').address
  console.log(lordsTokensAddress)
  const lordsTokens = new ethers.Contract(
    lordsTokensAddress,
    LordsTokenAbi.abi,
    signer
  )

  const lords = await lordsTokens.balanceOf(owner)

  return ethers.utils.formatEther(lords)
}
async function getGoldBalance(owner, network) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const goldToken = new ethers.Contract(
    '0x32353A6C91143bfd6C7d363B546e62a9A2489A20',
    GoldAbi,
    signer
  )

  const lords = await goldToken.balanceOf(owner)

  return ethers.utils.formatEther(lords)
}
async function timeToNextAge(network) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const lordsTokensFacetAddress = contractAddress[network].realmsDiamond

  const lordsTokens = new ethers.Contract(
    lordsTokensFacetAddress,
    LordsClaimingFacetAbi.abi,
    signer
  )

  return await lordsTokens.timeToNextAge()
}
