<template>
  <div class="bg-gray-1000 min-h-screen flex flex-wrap sm:flex-nowrap">
    <div class="sm:hidden w-full mt-12 flex justify-between px-10">
      <div>
        <button class="text-xl" @click="toggleSideBar">Menu</button>
      </div>

      <NuxtLink to="/"><Book class="w-12 h-12 mx-auto" /></NuxtLink>
    </div>
    <NotificationBar />
    <SideBar class="fixed sm:relative w-80 min-h-screen" />
    <div class="w-full">
      <AccountButton />

      <Nuxt keep-alive class="p-3 sm:p-8" />
      <Modal />
    </div>
  </div>
</template>
<script>
import { defineComponent, watch } from '@nuxtjs/composition-api'
import { useWeb3 } from '@instadapp/vue-web3'
import { useUiState } from '~/composables'
import { useResources } from '~/composables/resources/useResources'
import { useConnect } from '~/composables/web3/useConnect'
import Book from '~/assets/img/book-open.svg?inline'
import { useRaiding } from '~/composables/military/useRaiding'

export default defineComponent({
  components: {
    Book,
  },
  setup() {
    const { fetchUsersBalance, allUsersResources } = useResources()
    const { account } = useWeb3()
    const { toggleSideBar, sideBarOpen } = useUiState()
    const { addRaidResultListener } = useRaiding()
    useConnect()

    watch(account, () => {
      addRaidResultListener()
      fetchUsersBalance()
    })

    return {
      toggleSideBar,
      sideBarOpen,
      allUsersResources,
    }
  },
})
</script>
