<template>
  <section>
    <h1>
      Mana <a href="https://genesisproject.xyz/">(The Genesis Project)</a>
    </h1>

    <p class="sm:text-2xl">
      Genesis Mana is claimed from any bag that contains items "of" one of the
      original 16 Orders of Loot. Players who assemble a perfect set of 8 items
      of the same Order unlock the ability to resurrect a Genesis Adventurer, an
      ancient and powerful being.
    </p>
    <div class="mt-4">
      <a
        class="px-5 py-2 rounded-xl bg-black hover:bg-gray-800"
        target="_blank"
        href="https://genesisproject.xyz"
        >Claim Here (Free)</a
      >
    </div>

    <div v-if="!$fetchState.pending" class="mt-8">
      <InfiniteScroll
        class="flex flex-wrap"
        :content-change-key="manas.length"
        @fetchNextBlock="fetchMore"
      >
        <div v-for="(mana, index) in manas" :key="index" class="w-80">
          <ManaCard :mana="mana" />
        </div>
        <template v-if="loading">
          <Loader
            v-for="(loader, index) in 4"
            :key="'dummy' + index"
            class="mr-3 mb-3"
          />
        </template>
      </InfiniteScroll>
    </div>
    <div v-else class="mt-8">
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

export default defineComponent({
  components: { InfiniteScroll },
  setup(props, context) {
    const { $graphql } = useContext()
    const search = ref()
    const offset = ref(1)
    const query = ref(gql`
      query manaQuery($offset: Int!) {
        manas(first: 100, skip: $offset) {
          id
          # lootTokenId {
          #   id
          # }
          itemName
          suffixId
          inventoryId
          currentOwner {
            address
            bagsHeld
            joined
          }
        }
      }
    `)

    const manas = ref(null)

    const submitSearch = () => {
      if (search.value.length === 42) {
        context.root.$router.push(`/adventurer/${search.value}`)
      }
    }

    useFetch(async () => {
      const response = await $graphql.mainnet.request(query.value, {
        offset: offset.value,
      })
      manas.value = response.manas
    })

    const loading = ref(false)

    const fetchMore = async () => {
      loading.value = true

      offset.value = offset.value + 100

      try {
        const response = await $graphql.mainnet.request(query.value, {
          offset: offset.value,
        })
        manas.value = manas.value.concat(response.manas)
      } catch (e) {
        console.log(e)
      } finally {
        loading.value = false
      }
    }

    return {
      manas,
      search,
      submitSearch,
      fetchMore,
      loading,
    }
  },
})
</script>
