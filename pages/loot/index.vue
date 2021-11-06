<template>
  <section>
    <h1>Loot</h1>
    <form class="flex flex-wrap" method="POST" @submit.prevent="submitSearch">
      <DropDown
        class="my-2 sm:my-0"
        :items="lootFeatures"
        @itemSelect="setQuery"
      />
      <input
        v-model="search"
        placeholder="Insert Loot item name"
        class="bg-black rounded-xl px-4 py-2 text-xl sm:mx-2"
        type="text"
      />
      <BButton
        class="px-4 py-3 hover:bg-black transition duration-150 rounded"
        type="primary"
      >
        Find Item Bags
      </BButton>
    </form>
    <div v-if="!$fetchState.pending">
      <InfiniteScroll
        v-if="!queryLoading"
        class="flex flex-wrap"
        :content-change-key="loot.length"
        @fetchNextBlock="fetchMore"
      >
        <div v-for="(l, index) in loot" :key="index" class="w-80">
          <LootCard is-o-g :loot="l" />
        </div>
        <template v-if="loading">
          <Loader
            v-for="(loader, index) in 4"
            :key="'dummy' + index"
            class="mr-3 mb-3"
          />
        </template>
      </InfiniteScroll>

      <div v-if="queryLoading" class="flex flex-wrap mt-8">
        <Loader v-for="(loader, index) in 4" :key="index" class="mr-3 mb-3" />
      </div>
      <div v-if="!queryLoading && !loot.length" class="my-3">
        <div class="text-2xl">No Loot found - Try adjusting your query.</div>
      </div>
    </div>
    <div v-else class="mt-4">
      <Loader />
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
import Loader from '../../components/Loader'

export default defineComponent({
  components: { Loader, InfiniteScroll },
  setup(props, context) {
    const { $graphql } = useContext()
    const search = ref()
    const offset = ref(1)
    const query = ref(gql`
      query bagsQuery($offset: Int!) {
        bags(first: 100, skip: $offset) {
          id
          head
          neck
          chest
          hand
          ring
          weapon
          waist
          foot
          chestSuffixId
          footSuffixId
          handSuffixId
          headSuffixId
          neckSuffixId
          ringSuffixId
          waistSuffixId
          weaponSuffixId
          manasClaimed
          currentOwner {
            address
            bagsHeld
            joined
          }
        }
      }
    `)
    const getSearchQueryById = (param) => {
      return ref(gql`
        query bagsQuery($id: String) {
          bags(where: { id: $id }) {
            id
            head
            neck
            chest
            hand
            ring
            weapon
            waist
            foot
            chestSuffixId
            footSuffixId
            handSuffixId
            headSuffixId
            neckSuffixId
            ringSuffixId
            waistSuffixId
            weaponSuffixId
            manasClaimed
            currentOwner {
              address
              bagsHeld
              joined
            }
          }
        }
      `)
    }

    const getSearchQuery = (param) => {
      return ref(gql`
      query bagsQuery($offset: Int!, $search: String) {
        bags(first: 100, skip: $offset, where: { ${param}_contains: $search }) {
          id
          head
          neck
          chest
          hand
          ring
          weapon
          waist
          foot
          chestSuffixId
          footSuffixId
          handSuffixId
          headSuffixId
          neckSuffixId
          ringSuffixId
          waistSuffixId
          weaponSuffixId
          manasClaimed
          currentOwner {
            address
            bagsHeld
            joined
          }
        }
      }
    `)
    }

    const loot = ref(null)

    const lootFeatures = [
      {
        name: 'id',
      },
      {
        name: 'head',
      },
      {
        name: 'neck',
      },
      {
        name: 'chest',
      },
      {
        name: 'hand',
      },
      {
        name: 'ring',
      },
      {
        name: 'weapon',
      },
      {
        name: 'waist',
      },
      {
        name: 'foot',
      },
    ]

    const lootQuery = ref(lootFeatures[0])
    const queryLoading = ref(false)
    const loading = ref(false)

    const setQuery = (value) => {
      lootQuery.value = value
    }

    const toSentenceCase = (str) => {
      return str
        .replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        })
        .replace('Of', 'of')
    }

    const searchBy = async () => {
      queryLoading.value = true

      try {
        if (lootQuery.value.name === 'id') {
          const newQuery = getSearchQueryById(lootQuery.value.name)
          const response = await $graphql.mainnet.request(newQuery.value, {
            id: search.value,
          })
          loot.value = response.bags
        } else {
          const newQuery = getSearchQuery(lootQuery.value.name)
          const response = await $graphql.mainnet.request(newQuery.value, {
            offset: offset.value,
            search: toSentenceCase(search.value),
          })
          loot.value = response.bags
        }
      } catch (e) {
        console.log(e)
      } finally {
        queryLoading.value = false
      }
    }

    const submitSearch = () => {
      searchBy()
    }

    useFetch(async () => {
      const response = await $graphql.mainnet.request(query.value, {
        offset: offset.value,
      })
      loot.value = response.bags
    })

    const fetchMore = async () => {
      loading.value = true
      offset.value = offset.value + 100
      try {
        if (search.value) {
          const newQuery = getSearchQuery(lootQuery.value.name)
          const response = await $graphql.mainnet.request(newQuery.value, {
            offset: offset.value,
            search: search.value,
          })
          loot.value = loot.value.concat(response.bags)
        } else {
          const response = await $graphql.mainnet.request(query.value, {
            offset: offset.value,
          })
          loot.value = loot.value.concat(response.bags)
        }
      } catch (e) {
        console.log(e)
      } finally {
        loading.value = false
      }
    }

    return {
      loot,
      search,
      submitSearch,
      fetchMore,
      loading,
      lootFeatures,
      setQuery,
      lootQuery,
      queryLoading,
      offset,
    }
  },
})
</script>
