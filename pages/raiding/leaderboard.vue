<template>
  <div class="container mx-auto">
    <div class="w-full text-center">
      <h1>Raiding Leaderboard</h1>
      <p class="text-2xl">Find the top Raiders, & the most raided Realms.</p>

      <h2 class="mt-8">Top Raiders</h2>

      <div class="flex flex-wrap sm:space-x-3 my-3">
        <span class="pr-4 self-center">Order By:</span>
        <BButton
          v-for="(option, index) in raiderOrderByOptions"
          :key="index"
          type="primary"
          :class="{
            'bg-black text-red-300': option.id === orderBy.raider,
          }"
          class="
            px-2
            py-2
            hover:bg-black
            rounded
            capitalize
            hover:text-red-300
            mb-2
            mr-2
          "
          @click="setOrderBy(option, 'raider')"
        >
          {{ option.name }}
        </BButton>
      </div>
      <RaidingResultsLeaderboardTable
        type="raid"
        :loading="loading.raiderResults"
        :results="raiderResults"
      />

      <h2 class="mt-8">Top Defenders</h2>

      <div class="flex flex-wrap sm:space-x-3 my-3">
        <span class="pr-4 self-center">Order By:</span>
        <BButton
          v-for="(option, index) in defenderOrderByOptions"
          :key="index"
          type="primary"
          :class="{ 'bg-black text-red-300': option.id === orderBy.defender }"
          class="
            px-2
            py-2
            hover:bg-black
            rounded
            capitalize
            hover:text-red-300
            mb-2
            mr-2
          "
          @click="setOrderBy(option, 'defender')"
        >
          {{ option.name }}
        </BButton>
      </div>
      <RaidingResultsLeaderboardTable
        type="defend"
        :loading="loading.defenderResults"
        :results="defenderResults"
      />
    </div>
  </div>
</template>
<script>
import {
  defineComponent,
  useFetch,
  reactive,
  ref,
} from '@nuxtjs/composition-api'
import { useRaiding } from '~/composables/military/useRaiding'

export default defineComponent({
  setup() {
    const { getAdventurerRaidResults } = useRaiding()
    const raiderResults = ref([])
    const defenderResults = ref([])
    const first = ref(8)
    const skip = ref({ raider: 0, defender: 0 })
    const loading = reactive({
      raiderResults: false,
      defenderResults: false,
    })
    const raiderOrderByOptions = [
      {
        id: 'raidAttacks',
        name: 'Raids',
      },
      {
        id: 'raiderUnitsLost',
        name: 'Units Lost',
      },
    ]
    const defenderOrderByOptions = [
      {
        id: 'raidDefends',
        name: 'Raids',
      },
      {
        id: 'defenderUnitsLost',
        name: 'Units Killed',
      },
    ]
    const orderBy = ref({
      raider: null,
      defender: null,
    })
    orderBy.value.raider = raiderOrderByOptions[0].id
    orderBy.value.defender = defenderOrderByOptions[0].id

    const setOrderBy = async (option, type) => {
      skip.value[type] = 0
      orderBy.value[type] = option.id
      // TODO update subgraph format for wallet raid results
      if (type === 'raider') {
        loading.raiderResults = true
        raiderResults.value = await getAdventurerRaidResults(
          getFilters('raider')
        )
        loading.raiderResults = false
      } else {
        loading.defenderResults = true

        defenderResults.value = await getAdventurerRaidResults(
          getFilters('defender')
        )
        loading.defenderResults = false
      }
    }
    const getFilters = (type) => {
      return {
        value: {
          first: first.value,
          skip: skip.value[type],
          orderBy: orderBy.value[type],
        },
      }
    }
    useFetch(async () => {
      loading.raiderResults = true
      loading.defenderResults = true
      raiderResults.value = await getAdventurerRaidResults(getFilters('raider'))
      defenderResults.value = await getAdventurerRaidResults(
        getFilters('defender')
      )
      loading.raiderResults = false
      loading.defenderResults = false
    })
    return {
      raiderResults,
      orderBy,
      loading,
      setOrderBy,
      defenderResults,
      raiderOrderByOptions,
      defenderOrderByOptions,
    }
  },
})
</script>
