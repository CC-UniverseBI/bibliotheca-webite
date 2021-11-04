import { reactive, ref, Ref } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { useWeb3 } from '@instadapp/vue-web3'
import { useNetwork, activeNetwork } from '../web3/useNetwork'
import { useNotification } from '~/composables/useNotification'
// ABI
import ArmyTrainingFacet from '~/abi/ArmyTrainingFacet.json'

// ADDRESS CONSTS
import contractAddress from '~/constant/contractAddress'

export function useMilitary() {
  const { useL2Network } = useNetwork()
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
      if (e.data) {
        await showError(e.data.message)
      }
    } finally {
      console.log('2')
      await fetchRaiding(realmId)
      loading.buildRaiding = false
    }
  }
  const raidingArmy = ref()
  const offence = ref()
  const fetchRaiding = async (realmId) => {
    try {
      error.buildRaiding = null
      loading.fetching = true
      raidingArmy.value = await getRaidingArmy(useL2Network.value.id, realmId)

      offence.value = raidingArmy.value[0] * 250 + raidingArmy.value[2] * 100
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
        useL2Network.value.id,
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
      unitCost.value = await getUnitCost(useL2Network.value.id, unitId)
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
    offence,
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
  const diamondAddress = contractAddress[activeNetwork.value.id].realmsDiamond
  const signer = provider.getSigner()

  const armyTrainingFacet = new ethers.Contract(
    diamondAddress,
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
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const armyTrainingFacet = new ethers.Contract(
    diamondAddress,
    ArmyTrainingFacet.abi,
    signer
  )

  return await armyTrainingFacet.getRaidingArmy(realmId)
}

async function getDefensiveArmy(network, realmId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const armyTrainingFacet = new ethers.Contract(
    diamondAddress,
    ArmyTrainingFacet.abi,
    signer
  )

  return await armyTrainingFacet.getDefensiveArmy(realmId)
}

async function getUnitCost(network, unitId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()

  const armyTrainingFacet = new ethers.Contract(
    diamondAddress,
    ArmyTrainingFacet.abi,
    signer
  )

  return await armyTrainingFacet.getUnitCost(unitId)
}
