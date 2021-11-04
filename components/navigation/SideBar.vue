<template>
  <div
    class="
      border-r border-gray-700
      p-4
      bg-gray-1000
      transform
      duration-300
      ease-in-out
      transition-all
      left-0
      z-20
    "
    :class="
      sideBarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
    "
  >
    <div class="sm:sticky top-10 flex flex-col z-30 h-screen">
      <div class="sm:hidden w-full">
        <button class="ml-auto" @click="toggleSideBar">
          <Close class="w-6 h-6" />
        </button>
      </div>

      <h2>
        <NuxtLink to="/"><Book class="w-16 h-16 mx-auto sm:mt-12" /></NuxtLink>
      </h2>
      <span class="text-center font-semibold text-2xl"
        ><span class="text-yellow-400">${{ goldPrice }}</span> $AGLD</span
      >

      <nav class="flex flex-col p-2 capitalize mt-8">
        <h4 class="mt-8 uppercase text-gray-700 tracking-wide pl-4">
          Settling
        </h4>
        <BButton
          v-if="account"
          :to="'/adventurer/' + account + '/empire'"
          type="navLink"
        >
          <span class="self-center">See My Empire</span>
        </BButton>
        <BButton
          v-for="link in settlingLinks"
          :key="link.title"
          type="navLink"
          :to="link.page"
          @click.native="toggleSideBar"
          >{{ link.title }}</BButton
        >
        <h4 class="mt-8 uppercase text-gray-700 tracking-wide pl-4">
          Loot Assets
        </h4>
        <BButton
          v-for="(link, i) in adventureLinks"
          :key="i"
          type="navLink"
          :to="link.page"
          @click.native="toggleSideBar"
        >
          <span class="flex"> {{ link.title }}</span>
        </BButton>
        <BButton
          v-for="link in assetLinks"
          :key="link.title"
          type="navLink"
          :to="link.page"
          @click.native="toggleSideBar"
          >{{ link.title }}</BButton
        >
        <h4 class="mt-8 uppercase text-gray-700 tracking-wide pl-4">
          Utilities
        </h4>
        <BButton
          v-for="link in utilLinks"
          :key="link.title"
          type="navLink"
          :to="link.page"
          @click.native="toggleSideBar"
          >{{ link.title }}</BButton
        >
      </nav>

      <div class="mt-auto flex flex-wrap py-10 justify-between px-4">
        <div class="w-full text-center text-xl pb-5 hover:underline">
          <a href="https://docs.bibliothecaforloot.com/alpha">Help Docs</a>
        </div>
        <div class="w-full text-center text-xl pb-5 hover:underline">
          <a href="https://forum.bibliothecaforloot.com/">Forum</a>
        </div>
        <a
          target="blank_"
          class="hover:bg-gracy-700 self-center"
          href="https://github.com/BibliothecaForAdventurers/bibliotheca-webite"
          ><Github class="w-8 h-8"
        /></a>
        <a
          target="blank_"
          class="hover:bg-gracy-700"
          href="https://discord.gg/8NS4JxGmUC"
          ><Discord class="w-8 h-8 fill-current"
        /></a>
        <a
          target="blank_"
          class="hover:bg-gracy-700"
          href="https://twitter.com/lootgraph"
          ><Twitter class="w-8 h-8 fill-current"
        /></a>
        <a
          target="blank_"
          class="hover:bg-gracy-700"
          href="https://medium.com/@bibliotheca"
        >
          <Medium class="w-8 h-8 fill-current" />
        </a>
      </div>
    </div>
  </div>
</template>
<script>
import { onMounted, ref } from '@vue/composition-api'
import { useWeb3 } from '@instadapp/vue-web3'
import { useUiState, usePrice } from '~/composables'
import Book from '~/assets/img/book-open.svg?inline'
import Close from '~/assets/img/x-square.svg?inline'
import Github from '~/assets/img/github.svg?inline'
import Discord from '~/assets/img/discord.svg?inline'
import Medium from '~/assets/img/medium.svg?inline'
import Twitter from '~/assets/img/twitter.svg?inline'
export default {
  name: 'SideBar',
  components: {
    Book,
    Close,
    Github,
    Discord,
    Medium,
    Twitter,
  },
  setup() {
    const { account } = useWeb3()
    const { toggleSideBar, sideBarOpen } = useUiState()
    const { goldPrice, getGoldPrice } = usePrice()

    const assetLinks = [
      {
        page: '/loot',
        title: 'Loot',
      },
      {
        page: '/realms',
        title: 'Realms',
      },

      {
        page: '/manas',
        title: 'Genesis Mana',
      },
    ]

    const utilLinks = [
      {
        page: '/bridge/arbitrum',
        title: 'Arbitrum Bridge',
      },
      {
        page: '/claim',
        title: 'Claims & Mints',
      },
      {
        page: '/realms/resources',
        title: 'Realm Resources',
      },
      {
        page: '/roadmap',
        title: 'Staking Roadmap',
      },
    ]

    const adventureLinks = [
      {
        page: '/adventurer',
        title: 'Search All',
      },
    ]
    const settlingLinks = ref([
      {
        page: '/settled-realms',
        title: 'Settled Realms',
      },
      {
        page: '/raiding/leaderboard',
        title: 'Raiding Leaderboard',
      },
    ])

    onMounted(() => {
      getGoldPrice()
      window.setInterval(() => {
        getGoldPrice()
      }, 20000)
    })

    return {
      toggleSideBar,
      sideBarOpen,
      goldPrice,
      getGoldPrice,
      assetLinks,
      utilLinks,
      adventureLinks,
      settlingLinks,
      account,
    }
  },
}
</script>
