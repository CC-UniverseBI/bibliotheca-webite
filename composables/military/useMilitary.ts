import { reactive, ref, Ref } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { useWeb3 } from '@instadapp/vue-web3'
import { useNetwork, activeNetwork } from '../web3/useNetwork'
import { useNotification } from '../web3/useNotification'
// ABI
import ArmyTrainingFacet from '~/abi/ArmyTrainingFacet.json'

// ADDRESS CONSTS
import diamondAddress from '~/constant/diamondAddress'

export function useMilitary() {
  const error = reactive({
    buildRaiding: null,
  })

  const loading = reactive({
    buildRaiding: false,
    fetching: false,
  })
  const { showError } = useNotification()
  const result = reactive({ resources: null })

  const buildRaiding = async (
    realmId,
    unitId,
    quantity,
    resourceIds,
    resourceValues
  ) => {
    try {
      error.buildRaiding = null
      loading.buildRaiding = true
      return await buildRaidingArmy(
        activeNetwork.value.id,
        realmId,
        unitId,
        quantity,
        resourceIds,
        resourceValues
      )
    } catch (e) {
      console.log(e)
      await showError(e.data.message)
    } finally {
      await fetchRaiding(realmId)
      await fetchDefence(realmId)
      loading.buildRaiding = false
    }
  }
  const raidingArmy = ref()
  const fetchRaiding = async (realmId) => {
    try {
      error.buildRaiding = null
      loading.fetching = true
      raidingArmy.value = await getRaidingArmy(activeNetwork.value.id, realmId)
    } catch (e) {
      console.log(e)
      error.buildRaiding = e.message
    } finally {
      loading.fetching = false
    }
  }
  const defensiveArmy = ref()
  const fetchDefence = async (realmId) => {
    try {
      error.buildRaiding = null
      loading.fetching = true
      defensiveArmy.value = await getDefensiveArmy(
        activeNetwork.value.id,
        realmId
      )
    } catch (e) {
      console.log(e)
      error.buildRaiding = e.message
    } finally {
      loading.fetching = false
    }
  }

  const unitCost = ref()
  const fetchUnitCost = async (unitId) => {
    try {
      error.buildRaiding = null
      loading.fetching = true
      unitCost.value = await getUnitCost(activeNetwork.value.id, unitId)
    } catch (e) {
      console.log(e)
      error.buildRaiding = e.message
    } finally {
      loading.fetching = false
    }
  }

  return {
    fetchDefence,
    defensiveArmy,
    buildRaiding,
    fetchRaiding,
    fetchUnitCost,
    unitCost,
    raidingArmy,
    error,
    loading,
    result,
  }
}

async function buildRaidingArmy(
  network,
  realmId,
  unitId,
  quantity,
  resourceIds,
  resourceValues
) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokensArr = diamondAddress[network].allTokens
  const signer = provider.getSigner()
  const tokensAddrArr = tokensArr.map((a) => a.address)

  const armyTrainingFacet = new ethers.Contract(
    tokensAddrArr[0],
    ArmyTrainingFacet.abi,
    signer
  )
  let build
  if (unitId === 0 || unitId === 1) {
    build = await armyTrainingFacet.buildRaidingArmy(
      realmId,
      unitId,
      quantity,
      resourceIds,
      resourceValues
    )
  } else {
    build = await armyTrainingFacet.buildDefenceArmy(
      realmId,
      unitId,
      quantity,
      resourceIds,
      resourceValues
    )
  }

  await build.wait()

  return build
}

async function getRaidingArmy(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokensArr = diamondAddress[network].allTokens
  const signer = provider.getSigner()
  const tokensAddrArr = tokensArr.map((a) => a.address)

  const armyTrainingFacet = new ethers.Contract(
    tokensAddrArr[0],
    ArmyTrainingFacet.abi,
    signer
  )

  return await armyTrainingFacet.getRaidingArmy(realmId)
}

async function getDefensiveArmy(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokensArr = diamondAddress[network].allTokens
  const signer = provider.getSigner()
  const tokensAddrArr = tokensArr.map((a) => a.address)

  const armyTrainingFacet = new ethers.Contract(
    tokensAddrArr[0],
    ArmyTrainingFacet.abi,
    signer
  )

  return await armyTrainingFacet.getDefensiveArmy(realmId)
}

async function getUnitCost(network, unitId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokensArr = diamondAddress[network].allTokens
  const signer = provider.getSigner()
  const tokensAddrArr = tokensArr.map((a) => a.address)

  const armyTrainingFacet = new ethers.Contract(
    tokensAddrArr[0],
    ArmyTrainingFacet.abi,
    signer
  )

  return await armyTrainingFacet.getUnitCost(unitId)
}
