import { reactive, ref, Ref } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { useWeb3 } from '@instadapp/vue-web3'
import { activeNetwork } from '../web3/useNetwork'
import { useBigNumber } from '../web3/useBigNumber'
import { useNotification } from '~/composables/useNotification'
import { useRealms } from '~/composables/web3/useRealms'
import StakingFacetAbi from '~/abi/StakingFacet.json'
import lootRealmsABI from '~/abi/lootRealms.json'
import SRealmTokenABI from '~/abi/SRealmToken.json'
import GetterFacet from '~/abi/GetterFacet.json'
import contractAddress from '~/constant/contractAddress'
import erc721tokens from '~/constant/erc721Tokens'

export function useStaking() {
  const { account } = useWeb3()
  const error = reactive({
    stake: null,
  })
  const { showError, showSuccess } = useNotification()
  const loading = reactive({
    stake: null,
  })
  const result = reactive({ stake: null })
  const balance = ref()
  const claimBalance = ref()
  const stakeRealm = async (realmId) => {
    try {
      error.stake = null
      loading.stake = true
      await setApprovalForAll(account.value, activeNetwork.value.id)
      result.stake = await stake(account.value, activeNetwork.value.id, realmId)
      const body = 'Successfully staked Realm ' + realmId
      showSuccess('Realm staked', body)
    } catch (e) {
      await showError(e.message)
      error.stake = e.message
    } finally {
      loading.stake = false
    }
  }

  const getRealmsResourceBalance = async (realmId) => {
    try {
      error.stake = null
      loading.stake = true
      balance.value = await getBalance(activeNetwork.value.id, realmId)
    } catch (e) {
      await showError(e.message)
      error.stake = e.message
    } finally {
      loading.stake = false
    }
  }

  const claimResources = async (realmId) => {
    try {
      error.stake = null
      loading.stake = true
      claimBalance.value = await claim(activeNetwork.value.id, realmId)
    } catch (e) {
      await showError(e.message)
      error.stake = e.message
    } finally {
      await getRealmsResourceBalance(realmId)
      loading.stake = false
    }
  }
  const claimAllResources = async () => {
    try {
      error.stake = null
      loading.stake = true
      claimBalance.value = await claimAll(activeNetwork.value.id)
    } catch (e) {
      await showError(e.message)
      error.stake = e.message
    } finally {
      loading.stake = false
    }
  }
  const getRealmsResourceIds = async (realmId) => {
    try {
      error.stake = null
      loading.stake = true
      return await getResourceIds(activeNetwork.value.id, realmId)
    } catch (e) {
      await showError(e.message)
      error.stake = e.message
    } finally {
      loading.stake = false
    }
  }
  const withdraw = async (realmId) => {
    try {
      error.stake = null
      loading.stake = true
      await setApprovalForAllSRealms(account.value, activeNetwork.value.id)
      return await unStakeAndExit(activeNetwork.value.id, realmId)
    } catch (e) {
      await showError(e.message)
      error.stake = e.message
    } finally {
      loading.stake = false
    }
  }

  const getTraits = async (realmId) => {
    try {
      error.stake = null
      loading.stake = true
      return await getAllTraits(activeNetwork.value.id, realmId)
    } catch (e) {
      console.log(e)
      error.stake = e.message
    } finally {
      loading.stake = false
    }
  }
  return {
    stakeRealm,
    getTraits,
    getRealmsResourceIds,
    getRealmsResourceBalance,
    claimResources,
    claimAllResources,
    claimBalance,
    balance,
    error,
    loading,
    result,
    withdraw,
  }
}

async function stake(owner, network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const resourceStakingFacet = new ethers.Contract(
    diamondAddress,
    StakingFacetAbi.abi,
    signer
  )
  console.log(resourceStakingFacet)
  const stake = await resourceStakingFacet.stakeRealm(realmId)
  await stake.wait()

  return stake
}
// TODO: make generic
async function setApprovalForAll(owner, network) {
  const diamondAddress = contractAddress[network].realmsDiamond

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const realmsAddress = erc721tokens[network].realms.address
  const signer = provider.getSigner()

  const realmsContract = new ethers.Contract(
    realmsAddress,
    lootRealmsABI,
    signer
  )

  const isApproved = await realmsContract.isApprovedForAll(
    owner,
    diamondAddress
  )
  console.log(isApproved)
  if (isApproved) {
    return
  }
  const approve = await realmsContract.setApprovalForAll(diamondAddress, true)
  await approve.wait()
  return approve
}
// TODO: make generic
async function setApprovalForAllSRealms(owner, network) {
  const diamondAddress = contractAddress[network].realmsDiamond

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const srealmsAddress = erc721tokens[network].srealms.address

  const signer = provider.getSigner()

  const realmsContract = new ethers.Contract(
    srealmsAddress,
    SRealmTokenABI.abi,
    signer
  )
  const isApproved = await realmsContract.isApprovedForAll(
    owner,
    diamondAddress
  )
  console.log(isApproved)
  if (isApproved) {
    return
  }
  const approve = await realmsContract.setApprovalForAll(diamondAddress, true)
  await approve.wait()
  return approve
}

async function getBalance(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const getterFacet = new ethers.Contract(
    diamondAddress,
    GetterFacet.abi,
    signer
  )
  const day = await getterFacet.getVestingTime(realmId)
  const month = await getterFacet.get30DayVestingTime(realmId)
  const name = await getterFacet.getName(realmId)
  const resources = {
    day,
    month,
    name,
  }
  return resources
}

async function claim(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const resourceStakingFacet = new ethers.Contract(
    diamondAddress,
    StakingFacetAbi.abi,
    signer
  )

  const withdraw = await resourceStakingFacet.withdrawSingleRealmResources(
    realmId,
    '0x'
  )

  await withdraw.wait()

  return withdraw
}
async function claimAll(network) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const resourceStakingFacet = new ethers.Contract(
    diamondAddress,
    StakingFacetAbi.abi,
    signer
  )

  const withdraw = await resourceStakingFacet.withdrawAllResources()

  await withdraw.wait()

  return withdraw
}
async function getResourceIds(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const resourceStakingFacet = new ethers.Contract(
    diamondAddress,
    StakingFacetAbi.abi,
    signer
  )

  return await resourceStakingFacet.getResourceIds(realmId)
}

async function getAllTraits(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const resourceStakingFacet = new ethers.Contract(
    diamondAddress,
    StakingFacetAbi.abi,
    signer
  )

  return await resourceStakingFacet.getAllTraits(realmId)
}
async function unStakeAndExit(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const resourceStakingFacet = new ethers.Contract(
    diamondAddress,
    StakingFacetAbi.abi,
    signer
  )
  console.log(resourceStakingFacet)
  const withdraw = await resourceStakingFacet.unstakeAndExit(realmId)

  await withdraw.wait()

  return withdraw
}
