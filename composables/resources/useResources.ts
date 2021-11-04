import { reactive, ref, Ref, computed } from '@nuxtjs/composition-api'
import { ethers } from 'ethers'
import { useWeb3 } from '@instadapp/vue-web3'
import { useNetwork, activeNetwork } from '../web3/useNetwork'
import { getResourceListQuery } from './../graphql/queries'
import { useNotification } from '~/composables/useNotification'
// ABI
import ResourceConstructionFacetAbi from '~/abi/ResourceConstructionFacet.json'
import ResourceTokensAbi from '~/abi/ResourceTokens.json'

// ADDRESS CONSTS
import erc1155Tokens from '~/constant/erc1155Tokens'
import contractAddress from '~/constant/contractAddress'
import { useGraph } from '~/composables/web3/useGraph'

export function useResources() {
  const { provider, library, account, activate } = useWeb3()
  const { partnerNetwork, useL1Network, useL2Network } = useNetwork()
  const { gqlRequest } = useGraph()

  const { showError } = useNotification()
  const error = reactive({
    resources: null,
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

  const fetchResource = async (account, resourceId) => {
    try {
      error.resources = null
      // loading.resources = true
      return await getResourceBalance(
        account,
        useL2Network.value.id,
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
  const fetchProductionOutput = async (realmId, resourceId) => {
    try {
      error.resources = null
      // loading.resources = true
      output.value = await resourceProductionOutput(
        account.value,
        activeNetwork.value.id,
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
        activeNetwork.value.id,
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
        activeNetwork.value.id,
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
    getResourceList,
    fetchResource,
    fetchProductionOutput,
    upgradeResource,
    fetchUpgradeCost,
    upgradeCosts,
    error,
    loading,
    result,
    output,
  }
}

async function getResourceBalance(owner, network, resourceId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const resourcesAddress =
    erc1155Tokens[network].getTokenByKey('realm-resources').address
  const signer = provider.getSigner()
  const resources = new ethers.Contract(
    resourcesAddress,
    ResourceTokensAbi.abi,
    signer
  )

  return await resources.balanceOf(owner, resourceId)
}

async function resourceProductionOutput(owner, network, realmId, resourceId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond

  const signer = provider.getSigner()
  const resourceConstructionFacet = new ethers.Contract(
    diamondAddress,
    ResourceConstructionFacetAbi.abi,
    signer
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
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const diamondAddress = contractAddress[network].realmsDiamond
  const signer = provider.getSigner()
  const resourceConstructionFacet = new ethers.Contract(
    diamondAddress,
    ResourceConstructionFacetAbi.abi,
    signer
  )
  return await resourceConstructionFacet.getCosts(resourceId, level)
}
