import { reactive, ref, Ref, computed } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { getAccountPath } from '@ethersproject/hdnode'
import { useWeb3 } from '@instadapp/vue-web3'
import { useGraph } from '../web3/useGraph'
import { useNotification } from '~/composables/useNotification'
// ABI
import RaidingFacet from '~/abi/RaidingFacet.json'
import { getAdventurerRaidResultsQuery } from '~/composables/graphql/queries'
import { useNetwork, activeNetwork } from '~/composables/web3/useNetwork'

// ADDRESS CONSTS
import contractAddress from '~/constant/contractAddress'

const selectedAttacking = reactive({
  realm: false,
})
export function useRaiding() {
  const { account } = useWeb3()
  const { gqlRequest } = useGraph()
  const { useL2Network } = useNetwork()

  const { showError, showSuccess } = useNotification()
  const error = reactive({
    raidingRealm: null,
    raidChance: null,
    raidResults: null,
  })

  const loading = reactive({
    raidingRealm: false,
    raidResults: false,
    raidChance: false,
  })

  const raidResults = ref()
  const chance = ref()
  const raidChance = async (attackingRealmIdIn, defendingRealmIdIn) => {
    try {
      error.raidChance = null
      loading.raidChance = true
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const diamondAddress =
        contractAddress[activeNetwork.value.id].realmsDiamond
      const signer = provider.getSigner()
      const raidingFacet = new ethers.Contract(
        diamondAddress,
        RaidingFacet.abi,
        signer
      )
      chance.value = await raidingFacet.getChance(
        attackingRealmIdIn,
        defendingRealmIdIn
      )
    } catch (e) {
      await showError(e.data.message)
    } finally {
      loading.raidChance = false
    }
  }

  const raidingRealm = async (attackingRealmIdIn, defendingRealmIdIn) => {
    try {
      error.raidingRealm = null
      loading.raidingRealm = true
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const diamondAddress =
        contractAddress[activeNetwork.value.id].realmsDiamond
      const signer = provider.getSigner()
      let realmsResult
      const raidingFacet = new ethers.Contract(
        diamondAddress,
        RaidingFacet.abi,
        signer
      )
      addRaidResultListener()
      const tx = await raidingFacet.raidRealm(
        attackingRealmIdIn,
        defendingRealmIdIn
      )
      const { events } = await tx.wait()
      const args = events.find(({ event }) => event === 'RaidResult').args
      const result = getRaidResults(args)
      const body = 'The battle reasult was ' + result.raidResult
      showSuccess('Raid Completed', body)

      raidResults.value = result
    } catch (e) {
      console.log(e)
      await showError(e.data.message)
      error.raidingRealm = e.message
    } finally {
      loading.raidingRealm = false
    }
  }

  const addRaidResultListener = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const diamondAddress = contractAddress[activeNetwork.value.id].realmsDiamond
    const signer = provider.getSigner()
    let realmsResult
    const raidingFacet = new ethers.Contract(
      diamondAddress,
      RaidingFacet.abi,
      signer
    )
    console.log('adding raid result listener')
    raidingFacet.on(
      'RaidResult',
      (
        raidResult,
        attackingRealmId,
        defendingRealmId,
        attackerAddress,
        defenderAddress,
        raidingUnitsLost,
        defendingUnitsLost,
        resourcesIdsPillaged,
        resourcesValuesPillaged,
        unitsCaptured
      ) => {
        console.log('raid result from lister' + raidResult)
        if (defenderAddress === account.value) {
          const args = {
            raidResult,
            attackingRealm: attackingRealmId,
            defendingRealm: defendingRealmId,
            attackerAddress,
            defenderAddress,
            raidingUnitsLost,
            defendingUnitsLost,
            resourcesIdsPillaged,
            resourcesValuesPillaged,
            unitsCaptured,
          }
          const result = getRaidResults(args)
          console.log(result)
          raidResults.value = result
          const body =
            result.attackerAddress +
            ' captured resources: ' +
            resourcesIdsPillaged
          showSuccess('You were raided!', body)
        }
      }
    )
  }

  const getRaidResults = (args) => {
    return {
      raidResult: args.raidResult.toNumber(),
      attackingRealm: args.attackingRealm.toNumber(),
      defendingRealm: args.defendingRealm.toNumber(),
      attackerAddress: args.attackerAddress,
      defenderAddress: args.defenderAddress,
      raidingUnitsLost: args.raidingUnitsLost.toNumber(),
      defendingUnitsLost: args.defendingUnitsLost.toNumber(),
      resourcesIdsPillaged: args.resourcesIdsPillaged,
      resourcesValuesPillaged: args.resourcesValuesPillaged,
      unitsCaptured: args.unitsCaptured.toNumber(),
    }
  }
  const selectedAttackingRealm = computed(() => selectedAttacking.realm)

  const selectAttackingRealm = (realm) => {
    selectedAttacking.realm = realm
  }

  const removeAttackingRealm = () => {
    selectedAttacking.realm = null
  }
  enum OrderBy {
    raidAttacks,
  }
  const defaultVariables = (params?) => {
    return {
      address: params?.value?.address?.toLowerCase() || '',
      first: params?.value?.first || 12,
      skip: params?.value?.skip || 0,
      orderBy: params?.value?.orderBy || null,
      orderDirection: params?.value?.orderDirection || 'desc',
    }
  }

  const getAdventurerRaidResults = async (params) => {
    try {
      error.raidResults = null
      loading.raidResults = true
      console.log(defaultVariables(params))

      const { wallets } = await gqlRequest(
        getAdventurerRaidResultsQuery,
        defaultVariables(params),
        useL2Network.value.id
      )
      return wallets
    } catch (e) {
      console.log(e)
      error.raidResults = e
    } finally {
      loading.raidResults = false
    }
  }

  return {
    raidChance,
    chance,
    addRaidResultListener,
    raidingRealm,
    raidResults,
    getAdventurerRaidResults,
    selectedAttackingRealm,
    selectAttackingRealm,
    removeAttackingRealm,
    error,
    loading,
  }
}
