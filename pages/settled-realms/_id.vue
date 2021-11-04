<template>
  <section>
    <div v-if="!$fetchState.pending" class="flex flex-wrap">
      <div class="sm:w-1/2 sm:p-8">
        <a
          class="pb-1"
          :href="
            'https://opensea.io/assets/0x7afe30cb3e53dba6801aa0ea647a0ecea7cbe18d/' +
            openSeaData.token_id
          "
          target="_blank"
          >View Realm on Open Sea</a
        >
        <RealmRarity class="mb-8 text-xl" :traits="openSeaData.traits" />
        <h3 class="mt-3">
          👑
          <NuxtLink
            class="hover:underline"
            :to="'/adventurer/' + openSeaData.owner.address"
            >{{ shortenHash(openSeaData.owner.address) }}</NuxtLink
          >
        </h3>
        <h1 class="sm:text-6xl">
          {{ openSeaData.name }} - #{{ openSeaData.token_id }}
        </h1>
        <div v-if="order(openSeaData.traits)" class="py-4">
          <OrderChip class="text-xl" :order="order(openSeaData.traits).value" />
        </div>
        <div v-else>
          <span class="bg-gray-800 px-2 py-1 rounded">
            No Order Discovered yet. Check back soon.
          </span>
        </div>
        <div
          v-if="wonder(openSeaData.traits)"
          class="my-6 bg-black p-4 sm:p-6 rounded-2xl"
        >
          <h2>Realm Wonder</h2>
          <div
            v-if="wonder(openSeaData.traits)"
            class="
              px-8
              text-center text-white
              bg-gradient-to-r
              from-purple-200
              via-pink-200
              to-red-300
              text-red-500
              rounded
              py-1
              mb-2
              text-2xl
            "
          >
            {{ wonder(openSeaData.traits).value }}
          </div>
        </div>

        <div v-if="resources" class="my-6 bg-black p-4 sm:p-6 rounded-2xl">
          <h2>Realm Resources</h2>
          <div class="flex my-2 flex-wrap">
            <ResourceChip
              v-for="(resource, index) in resources"
              :key="index"
              class="text-xl"
              :resource="resource"
            />
          </div>
        </div>
        <div v-if="cities" class="my-6 bg-black p-4 sm:p-6 rounded-2xl">
          <h2>Realm Traits</h2>
          <Levels
            :cities="cities"
            :harbours="harbours"
            :regions="regions"
            :rivers="rivers"
          />
        </div>
        <div class="my-6 bg-black p-4 sm:p-6 rounded-2xl">
          <h2>Realm Sales: {{ openSeaData.num_sales }}</h2>
        </div>
      </div>
      <div class="sm:w-1/2">
        <img
          v-if="openSeaData.image_url"
          class="w-full relative rounded-2xl"
          :src="openSeaData.image_url"
          alt=""
        />
        <h4 v-else class="my-5">No image yet</h4>
      </div>
    </div>
    <div v-else>
      <Loader />
    </div>
  </section>
</template>
<script>
import {
  computed,
  defineComponent,
  ref,
  useFetch,
} from '@nuxtjs/composition-api'
import axios from 'axios'
import { useFormatting } from '~/composables/useFormatting'
export default defineComponent({
  setup(props, context) {
    const { shortenHash } = useFormatting()
    const { id } = context.root.$route.params
    const adventurer = ref(null)

    useFetch(async () => {
      const response = await axios.get(
        'https://api.opensea.io/api/v1/asset/0x7afe30cb3e53dba6801aa0ea647a0ecea7cbe18d/' +
          id +
          '/?force_update=true'
      )
      openSeaData.value = response.data
    })

    const openSeaData = ref()
    const loading = ref()

    const resources = computed(() => {
      return openSeaData.value.traits.length
        ? openSeaData.value.traits.filter(
            (resource) => resource.trait_type === 'Resource'
          )
        : null
    })
    const cities = computed(() => {
      return openSeaData.value.traits.length
        ? openSeaData.value.traits.find(
            (resource) => resource.trait_type === 'Cities'
          )
        : null
    })
    const harbours = computed(() => {
      return openSeaData.value.traits.length
        ? openSeaData.value.traits.find(
            (resource) => resource.trait_type === 'Harbors'
          )
        : null
    })
    const regions = computed(() => {
      return openSeaData.value.traits.length
        ? openSeaData.value.traits.find(
            (resource) => resource.trait_type === 'Regions'
          )
        : null
    })
    const rivers = computed(() => {
      return openSeaData.value.traits.length
        ? openSeaData.value.traits.find(
            (resource) => resource.trait_type === 'Rivers'
          )
        : null
    })
    const wonder = (traits) => {
      return traits.find(
        (resource) => resource.trait_type === 'Wonder (translated)'
      )
    }
    const order = (traits) => {
      return traits.find((resource) => resource.trait_type === 'Order')
    }
    return {
      adventurer,
      shortenHash,
      openSeaData,
      loading,
      resources,
      cities,
      harbours,
      regions,
      rivers,
      wonder,
      order,
    }
  },
})
</script>
