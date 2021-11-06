<template>
  <section>
    <div>
      <h2>All Adventurers</h2>
      <form method="POST" @submit.prevent="submitSearch">
        <input
          v-model="search"
          placeholder="insert wallet address"
          class="bg-black rounded px-4 py-2 text-xl"
          type="text"
        />
        <button class="px-4" type="submit">find adventurer</button>
      </form>

      <div class="mt-4 mb-2 pl-4 flex flex-wrap">
        <span class="pr-4 self-center">Rank By:</span>
        <BButton
          v-for="(button, index) in orderByButtons"
          :key="index"
          type="primary"
          :class="{ 'bg-black text-red-300': button.data === currentSortBy }"
          class="
            px-4
            py-2
            rounded
            hover:bg-black
            transition
            duration-150
            ease-linear
            mb-2
            mr-2
          "
          @click="orderBy(button.data)"
        >
          {{ button.label }}
        </BButton>
      </div>
      <InfiniteScroll
        v-if="!$fetchState.pending"
        class="flex flex-wrap"
        :content-change-key="adventurers.length"
        @fetchNextBlock="fetchMore"
      >
        <div
          v-for="(adventurer, index) in adventurers"
          :key="index"
          class="w-80"
        >
          <AdventurerCard :adventurer="adventurer" />
        </div>
        <template v-if="loading">
          <Loader
            v-for="(loader, index) in 4"
            :key="'dummy' + index"
            class="mr-3 mb-3"
          />
        </template>
      </InfiniteScroll>
      <div v-else class="flex flex-wrap mt-4">
        <Loader v-for="(loader, index) in 6" :key="index" class="mr-3 mb-3" />
      </div>
    </div>
  </section>
</template>

<script>
import { gql } from 'nuxt-graphql-request'
import {
  defineComponent,
  ref,
  useContext,
  useFetch,
} from '@nuxtjs/composition-api'
import InfiniteScroll from '../../components/atoms/InfiniteScroll'
import AdventurerCard from '~/components/cards/AdventurerCard.vue'

export default defineComponent({
  components: { InfiniteScroll, AdventurerCard },
  setup(props, context) {
    const getQuery = (param) => {
      return ref(gql`
        query walletQuery($offset: Int!) {
          wallets(
            orderBy: ${param}
            orderDirection: desc
            first: 100
            skip: $offset
            where: { ${param}_not: null }
          ) {
            id
            address
            realmsHeld
            bagsHeld
            gAdventurersHeld
            manasHeld
            mLootsHeld
          }
        }
      `)
    }

    const { $graphql } = useContext()
    const search = ref()
    const offset = ref(1)
    const currentSortBy = ref('bagsHeld')
    let query = getQuery(currentSortBy.value)

    const adventurers = ref(null)

    const orderByButtons = [
      {
        label: 'Loot',
        data: 'bagsHeld',
      },
      {
        label: 'mLoot',
        data: 'mLootsHeld',
      },
      {
        label: 'Realms',
        data: 'realmsHeld',
      },
      {
        label: 'GAs ',
        data: 'gAdventurersHeld',
      },
      {
        label: 'Mana',
        data: 'manasHeld',
      },
    ]

    const submitSearch = () => {
      if (search.value.length === 42) {
        context.root.$router.push(`/adventurer/${search.value}`)
      }
    }

    const { fetch } = useFetch(async () => {
      const response = await $graphql.mainnet.request(query.value, {
        offset: offset.value,
      })
      adventurers.value = response.wallets
    })

    const loading = ref(false)

    const fetchMore = async () => {
      loading.value = true

      offset.value = offset.value + 100

      try {
        const response = await $graphql.mainnet.request(query.value, {
          offset: offset.value,
        })
        adventurers.value = adventurers.value.concat(response.wallets)
      } catch (e) {
        console.log(e)
      } finally {
        loading.value = false
      }
    }

    const orderBy = (param) => {
      currentSortBy.value = param
      query = getQuery(param)
      fetch()
    }

    return {
      adventurers,
      orderByButtons,
      search,
      submitSearch,
      fetchMore,
      loading,
      orderBy,
      fetch,
      currentSortBy,
    }
  },
})
</script>
