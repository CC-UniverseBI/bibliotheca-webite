import {
  computed,
  onMounted,
  ref,
  watch,
  nextTick,
} from '@nuxtjs/composition-api'
// import { useLocalStorage } from 'vue-composable';

import { useWeb3 } from '@instadapp/vue-web3'
import { useModal } from '../useModal'
import { useNotification } from '~/composables/useNotification'
import { Network, allNetworks } from '~/constant/networks'

const activeNetworks = process.env.ACTIVE_NETWORKS.split(',')

export enum NetworkId {
  Mainnet = 'mainnet',
  Rinkeby = 'rinkeby',
  Arbitrum = 'arbitrum',
  ArbRinkeby = 'arbRinkeby',
}

const availableNetworks = allNetworks.filter((network) =>
  activeNetworks.includes(network.id)
)

export const activeNetworkId = ref<NetworkId>()
export const activeNetwork = computed(
  (): Network =>
    availableNetworks.find((n) => n.id === activeNetworkId.value) ||
    availableNetworks[0]
)
export function useNetwork() {
  const { showWarning } = useNotification()
  const { account, chainId } = useWeb3()
  const { showNetworksMismatchDialog } = useModal()

  const networkMismatch = computed(
    // eslint-disable-next-line eqeqeq
    () => chainId.value != activeNetwork.value?.chainId
  )

  const checkForNetworkMismatch = () => {
    if (networkMismatch.value) {
      showNetworksMismatchDialog()
      return true
    } else {
      return false
    }
  }
  const partnerNetwork = computed(() =>
    availableNetworks.find(
      (n) => n.chainId === activeNetwork.value.partnerChainID
    )
  )
  const setActiveNetwork = async (networkId) => {
    activeNetworkId.value = networkId
    await nextTick()
    checkForNetworkMismatch()
  }

  const useL1Network = computed((): Network => {
    if (!activeNetwork.value.isArbitrum) {
      return activeNetwork.value
    } else {
      return partnerNetwork.value
    }
  })

  const useL2Network = computed((): Network => {
    if (activeNetwork.value.isArbitrum) {
      return activeNetwork.value
    } else {
      return partnerNetwork.value
    }
  })
  async function switchToMainnet() {
    if (window.ethereum) {
      const chainData = {
        chainId: '0x1',
      }

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [chainData],
        })
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }

  async function switchToRinkeby() {
    if (window.ethereum) {
      const chainData = {
        chainId: '0x4',
      }

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [chainData],
        })
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }

  async function switchToArbRinkeby() {
    if (window.ethereum) {
      const chainId = '0x66eeb'

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        })
      } catch (switchError) {
        // 4902 error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          // eslint-disable-next-line max-depth
          try {
            const chainData = {
              chainId,
              chainName: 'Arbitrum Testnet',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ARETH',
                decimals: 18,
              },
              rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
              blockExplorerUrls: ['testnet.arbiscan.io/'],
            }
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [chainData, account.value],
            })
          } catch (addError) {
            return Promise.reject(addError)
          }
        } else {
          return Promise.reject(switchError)
        }
      }
    }
  }
  async function switchToArbitrum() {
    if (window.ethereum) {
      const chainId = '0xa4b1'

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        })
      } catch (switchError) {
        // 4902 error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          // eslint-disable-next-line max-depth
          try {
            const chainData = {
              chainId,
              chainName: 'Arbitrum One',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'AETH',
                decimals: 18,
              },
              rpcUrls: ['https://arbitrum.io/rpc'],
              blockExplorerUrls: ['https://arbiscan.io//'],
            }
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [chainData, account.value],
            })
          } catch (addError) {
            return Promise.reject(addError)
          }
        } else {
          return Promise.reject(switchError)
        }
      }
    }
  }
  async function switchNetwork() {
    try {
      if (activeNetwork.value.id === 'mainnet') {
        await switchToMainnet()
      } else if (activeNetwork.value.id === 'rinkeby') {
        await switchToRinkeby()
      } else if (activeNetwork.value.id === 'arbitrumRinkeby') {
        await switchToArbRinkeby()
      } else {
        await switchToArbitrum()
      }
      return Promise.resolve()
    } catch (error) {
      showWarning('Failed to switch network')
      return Promise.reject(error)
    }
  }

  watch(activeNetworkId, () => {
    localStorage.setItem('network', activeNetwork.value.id)
  })

  onMounted(() => {
    if (activeNetworkId.value) {
      return
    }
    // @ts-ignore issue
    activeNetworkId.value = localStorage.getItem('network') || 'mainnet'
  })

  return {
    networkMismatch,
    activeNetworkId,
    availableNetworks,
    chainId,
    setActiveNetwork,
    switchNetwork,
    checkForNetworkMismatch,
    partnerNetwork,
    useL1Network,
    useL2Network,
  }
}
