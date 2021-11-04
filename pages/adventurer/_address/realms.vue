<template>
  <div>
    <div class="flex">
      <nav class="space-x-4 mb-8 bg-gray-900 px-2 py-3 rounded-2xl">
        <BButton
          v-for="(link, index) in menuLinks"
          :key="index"
          class="
            rounded-xl
            px-6
            py-3
            font-body
            hover:bg-black hover:text-red-600
            border-2 border-transparent
            uppercase
          "
          :class="[activeTab === link.slug ? 'text-red-600' : 'text-gray-400']"
          @click.native="currentTab(link.slug)"
          >{{ link.title }}</BButton
        >
      </nav>
    </div>
    <FilteredSRealms v-if="activeTab === 'srealms'" type="user" />
    <Settling v-else />
  </div>
</template>
<script>
import { defineComponent, ref, useFetch } from '@nuxtjs/composition-api'
import { useWeb3 } from '~/composables/web3'
import { useConnect } from '~/composables/web3/useConnect'
import { useNetwork } from '~/composables/web3/useNetwork'
export default defineComponent({
  setup() {
    const {
      activeNetworkId,
      checkForNetworkMismatch,
      networkMismatch,
      useL2Network,
    } = useNetwork()
    const { account } = useWeb3()
    const { isAddressPage } = useConnect()

    const menuLinks = ref([
      {
        title: 'Settled Realms',
        slug: 'srealms',
      },
      {
        title: 'Unsettled Realms',
        slug: 'realms',
      },
    ])
    const activeTab = ref('srealms')
    const currentTab = (tab) => {
      activeTab.value = tab
    }
    useFetch(() => {
      activeNetworkId.value = useL2Network.value.id
      if (account.value) {
        if (networkMismatch.value) {
          checkForNetworkMismatch()
        }
      }
    })
    return {
      menuLinks,
      currentTab,
      activeTab,
      isAddressPage,
    }
  },
})
</script>
