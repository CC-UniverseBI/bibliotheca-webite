/* eslint-disable max-depth */
import {
  computed,
  reactive,
  onMounted,
  useContext,
  ref,
  watch,
} from '@nuxtjs/composition-api'
import { useWeb3 } from '@instadapp/vue-web3'
import { buildSRealmsWhere } from '../graphql/helpers/search'
import { useNetwork, activeNetwork } from './useNetwork'
import { getRealms, getSRealmsQuery } from './../graphql/queries'
import { useWeb3Modal } from '~/composables/web3/useWeb3Modal'
import { useGraph } from '~/composables/web3/useGraph'
export enum Layers {
  l1,
  l2,
}
export function useRealms() {
  const loading = ref(false)
  const error = reactive({
    getWalletRealms: null,
  })
  const { account } = useWeb3()
  const { gqlRequest } = useGraph()
  const { useL1Network, useL2Network } = useNetwork()
  const { open } = useWeb3Modal()
  const userRealms = ref({
    l1: null,
    l2: null,
  })
  const userSRealms = ref([])
  const sRealms = ref()

  const fetchUserRealms = async (account, layer) => {
    let network
    if (layer === 'l1') {
      network = useL1Network.value.id
    } else {
      network = useL2Network.value.id
    }
    const { realms } = await gqlRequest(
      getRealms,
      { address: account.toLowerCase() },
      network
    )
    return realms
  }

  const getWalletRealms = async (address?: null, layer?: Layers) => {
    try {
      error.getWalletRealms = null
      loading.value = true

      const userAddress = address || account.value
      if (!layer) {
        Promise.all([
          (userRealms.value.l1 = await fetchUserRealms(userAddress, 'l1')),
          (userRealms.value.l2 = await fetchUserRealms(userAddress, 'l2')),
        ])
      } else {
        userRealms.value[layer] = await fetchUserRealms(userAddress, layer)
      }
    } catch (e) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const defaultVariables = (params?) => {
    console.log(params)
    return {
      address: params?.value?.address?.toLowerCase() || '',
      resources: params?.value?.resources || [],
      orders: params?.value?.orders?.length
        ? params?.value?.orders
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      first: params?.value?.first || 12,
      skip: params?.value?.skip || 0,
    }
  }

  const fetchSRealms = async (params?) => {
    console.log(defaultVariables(params))
    const { srealms } = await gqlRequest(
      getSRealmsQuery,
      defaultVariables(params),
      useL2Network.value.id
    )
    return srealms
  }

  const getSRealms = async (params) => {
    try {
      error.getWalletRealms = null
      loading.value = true
      sRealms.value = await fetchSRealms(params)
    } catch (e) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const getUserSRealms = async (params?) => {
    const searchParams = params || { value: {} }
    try {
      searchParams.value.address = account.value
      error.getWalletRealms = null
      loading.value = true
      console.log('user realms')
      userSRealms.value = await fetchSRealms(searchParams)
    } catch (e) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  return {
    getUserSRealms,
    getWalletRealms,
    getSRealms,
    error,
    loading,
    userSRealms,
    userRealms,
    sRealms,
  }
}
