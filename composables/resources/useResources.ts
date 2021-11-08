import { reactive, ref, Ref, computed } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { useWeb3 } from '@instadapp/vue-web3'
import { useNetwork, activeNetwork } from '../web3/useNetwork'
import { useBridge } from '../bridge/useBridge'
import {
  getResourceListQuery,
  getResourceBalancesQuery,
} from './../graphql/queries'
import { useNotification } from '~/composables/useNotification'
// ABI
import ResourceConstructionFacetAbi from '~/abi/ResourceConstructionFacet.json'
import ResourceTokensAbi from '~/abi/ResourceTokens.json'

// ADDRESS CONSTS
import erc1155Tokens from '~/constant/erc1155Tokens'
import contractAddress from '~/constant/contractAddress'
import { useGraph } from '~/composables/web3/useGraph'
import { resources } from '~/composables/utils/resourceColours'

const allUsersResources = ref({ resources, lords: null })
export function useResources() {
  const { provider, library, account, active } = useWeb3()
  const { partnerNetwork, useL1Network, useL2Network } = useNetwork()
  const { gqlRequest } = useGraph()
  const { getL2Signer } = useBridge()
  const { showError } = useNotification()
  const error = reactive({
    resources: null,
    balances: null,
  })

  const loading = reactive({
    resources: false,
    fetchingResources: false,
  })

  const result = reactive({ resources: null })
  const output = ref()
  const resourceList = ref([])

  const getResourceList = async () => {
    try {
      error.resources = null
      // loading.resources = true
      const { resources } = await gqlRequest(
        getResourceListQuery,
        null,
        useL2Network.value.id
      )
      resourceList.value = resources
    } catch (e) {
      console.log(e)
      await showError(e.message)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }

  const resourceListOrdered = computed(() => {
    return resourceList.value.sort((a, b) => {
      return b.totalRealms - a.totalRealms
    })
  })
  const resourceBalance = ref([])
  const lordsBalance = ref()

  const balance = ref()

  const fetchUsersBalance = async (address) => {
    // TODO add users Wonders
    console.log(address)
    const fetchAddress = address || account.value
    try {
      error.balances = null
      // loading.resources = true
      const { accounts } = await gqlRequest(
        getResourceBalancesQuery,
        { address: fetchAddress.toLowerCase() },
        useL2Network.value.id + 'Resources'
      )
      console.log(accounts[0].balances)
      const updatedBalances = allUsersResources.value.resources.map(
        (resource) => {
          if (accounts[0].balances) {
            resource.balance = parseInt(
              accounts[0].balances.find(
                (balance) => parseInt(balance.token.identifier) === resource.id
              )?.value
            )
          }
          return resource
        }
      )
      if (address) {
        resourceBalance.value = updatedBalances
        lordsBalance.value = accounts[0].balances[23].value
      } else {
        allUsersResources.value.resources = updatedBalances
        allUsersResources.value.lords = accounts[0].balances[23].value
      }
    } catch (e) {
      console.log(e)
      await showError(e.message)
      error.balances = e.message
    } finally {
      // loading.resources = false
    }
    loading.resources = false
  }
  const fetchProductionOutput = async (realmId, resourceId) => {
    try {
      error.resources = null
      // loading.resources = true
      output.value = await resourceProductionOutput(
        account.value,
        useL2Network.value,
        realmId,
        resourceId
      )
    } catch (e) {
      console.log(e)
      await showError(e.message)
      error.resources = e.message
    } finally {
      // loading.resources = false
    }
  }

  const upgradeCosts = ref()
  const fetchUpgradeCost = async (resourceId, level) => {
    try {
      error.resources = null
      loading.fetchingResources = true
      upgradeCosts.value = await upgradeCost(
        account.value,
        useL2Network.value,
        resourceId,
        level
      )
    } catch (e) {
      console.log(e)
      await showError(e.message)
      error.resources = e.message
    } finally {
      loading.fetchingResources = false
    }
  }
  const upgradeResource = async (realmId, resourceId, level) => {
    loading.resources = true
    try {
      error.resources = null
      loading.resources = true

      await fetchUpgradeCost(resourceId, level)
      await upgradeResourceProduction(
        account.value,
        useL2Network.value.id,
        realmId,
        resourceId,
        upgradeCosts.value[0],
        upgradeCosts.value[1]
      )
    } catch (e) {
      if (e.data) {
        await showError(e.data.message)
      }
    } finally {
      loading.resources = false
    }
  }
  return {
    resourceList,
    resourceListOrdered,
    resourceBalance,
    lordsBalance,
    getResourceList,
    fetchProductionOutput,
    upgradeResource,
    fetchUpgradeCost,
    upgradeCosts,
    error,
    loading,
    result,
    output,
    fetchUsersBalance,
    allUsersResources,
    balance,
  }
}

async function resourceProductionOutput(owner, network, realmId, resourceId) {
  const provider = new ethers.providers.JsonRpcProvider(network.url)
  const diamondAddress = contractAddress[network.id].realmsDiamond

  const signer = provider.getSigner()
  const resourceConstructionFacet = new ethers.Contract(
    diamondAddress,
    ResourceConstructionFacetAbi.abi,
    provider
  )

  return await resourceConstructionFacet.getProductionDetails(
    realmId,
    resourceId
  )
}

async function upgradeResourceProduction(
  owner,
  network,
  realmId,
  resourceId,
  upgradeResourceIds,
  upgradeResourceValues
) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()
  const resourceConstructionFacet = new ethers.Contract(
    diamondAddress,
    ResourceConstructionFacetAbi.abi,
    signer
  )
  const construct = await resourceConstructionFacet.upgradeResource(
    realmId,
    resourceId,
    upgradeResourceIds,
    upgradeResourceValues
  )
  await construct.wait()
  return construct
}

async function upgradeCost(owner, network, resourceId, level) {
  const provider = new ethers.providers.JsonRpcProvider(network.url)
  const diamondAddress = contractAddress[network.id].realmsDiamond
  const resourceConstructionFacet = new ethers.Contract(
    diamondAddress,
    ResourceConstructionFacetAbi.abi,
    provider
  )
  return await resourceConstructionFacet.getCosts(resourceId, level)
}
