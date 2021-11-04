import { reactive, ref, Ref } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { useNetwork } from '../web3/useNetwork'
import { useWeb3 } from '../web3'

import StakingFacetAbi from '~/abi/StakingFacet.json'

import GetterFacetAbi from '~/abi/GetterFacet.json'
import contractAddress from '~/constant/contractAddress'

export function useStatistics() {
  const { useL2Network } = useNetwork()
  const { account } = useWeb3()
  const error = reactive({
    stake: null,
  })

  const loading = reactive({
    stake: null,
  })

  const happiness = ref()

  const getHappiness = async (realmId) => {
    try {
      error.stake = null
      loading.stake = true
      happiness.value = await getRealmHappiness(useL2Network.value.id, realmId)
    } catch (e) {
      console.log(e)
      error.stake = e.message
    } finally {
      loading.stake = false
    }
  }
  const realmStatistics = ref()
  const getStatistics = async (realmId) => {
    try {
      error.stake = null
      loading.stake = true
      realmStatistics.value = await getAllStatistics(
        useL2Network.value.id,
        realmId
      )
    } catch (e) {
      console.log(e)
      error.stake = e.message
    } finally {
      loading.stake = false
    }
  }
  const ageClaimed = ref()
  const getRealmAgeClaimed = async (realmId) => {
    try {
      error.stake = null
      loading.stake = true
      ageClaimed.value = await getAgeClaimed(useL2Network.value.id, realmId)
    } catch (e) {
      console.log(e)
      error.stake = e.message
    } finally {
      loading.stake = false
    }
  }
  return {
    getRealmAgeClaimed,
    ageClaimed,
    getHappiness,
    getStatistics,
    realmStatistics,
    happiness,
    error,
    loading,
  }
}

async function getRealmHappiness(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokenAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const resourceStakingFacet = new ethers.Contract(
    tokenAddress,
    StakingFacetAbi.abi,
    signer
  )

  return await resourceStakingFacet.getHappiness(realmId)
}

async function getAllStatistics(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokenAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const getterFacet = new ethers.Contract(
    tokenAddress,
    GetterFacetAbi.abi,
    signer
  )

  return await getterFacet.getAllStatistics(realmId)
}

async function getAgeClaimed(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokenAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const getterFacetAbi = new ethers.Contract(
    tokenAddress,
    GetterFacetAbi.abi,
    signer
  )

  return await getterFacetAbi.getRealmAgeInfo(realmId)
}
