<template>
  <div v-if="adventurer" class="w-full">
    <div class="flex">
      <nav class="space-x-4 mb-12 bg-gray-900 px-3 py-5 rounded-2xl">
        <BButton
          v-for="(link, index) in menuLinks"
          :key="index"
          class="
            rounded-xl
            px-6
            hover:bg-black hover:text-red-600
            border-2 border-transparent
            uppercase
          "
          :class="[activeTab === link.slug ? 'text-red-400' : 'text-gray-400']"
          @click.native="currentTab(link.slug)"
          >{{ link.title }}</BButton
        >
      </nav>
    </div>
    <div v-if="activeTab === 'raiding'" class="flex flex-wrap space-x-4">
      <div v-if="adventurer.l2 && adventurer.l2.raiderResults">
        <RaidingResultsTable :results="adventurer.l2.raiderResults" />
      </div>
    </div>
    <div v-else class="flex flex-wrap space-x-4">
      <div v-if="adventurer.l2 && adventurer.l2.defenderResults">
        <RaidingResultsTable :results="adventurer.l2.defenderResults" />
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, onMounted, ref } from '@vue/composition-api'

import { useAdventurer } from '~/composables/useAdventurer'
// import { useWeb3Modal } from '~/composables/web3/useWeb3Modal'
export default defineComponent({
  setup(props, context) {
    const { address } = context.root.$route.params
    const { getAdventurer, adventurer, loading } = useAdventurer()
    const activeTab = ref('raiding')
    const currentTab = (tab) => {
      activeTab.value = tab
    }
    const menuLinks = ref([
      {
        title: 'Raiding',
        slug: 'raiding',
      },
      {
        title: 'Defending',
        slug: 'defending',
      },
    ])
    onMounted(async () => {
      if (!adventurer.value?.l2) {
        await getAdventurer(address, 'l2')
      }
    })
    return { adventurer, loading, menuLinks, currentTab, activeTab }
  },
})
</script>
