<template>
  <tr class="text-xl bg-opacity-85">
    <td class="p-2">
      <div
        :class="resource.colourClass"
        class="border rounded-xl self-center mr-3 p-2 bg-opacity-75"
      >
        {{ resource.trait }}
      </div>
    </td>
    <td class="p-2">
      <span v-if="loading.resources"><LoadingDots class="w-8 h-2" /></span
      ><span v-else>{{ balance }}</span>
    </td>
    <!-- <td class="p-2">{{ resource.price }}</td> -->
    <!-- <td class="p-2">{{ resource.value }}</td> -->
    <td class="p-2">
      <BButton class="text-xs" type="primary" @click="addToMarket(resource)"
        >Add to Market</BButton
      >
    </td>
  </tr>
</template>
<script>
import { defineComponent, useFetch } from '@nuxtjs/composition-api'
import { useResources } from '~/composables/resources/useResources'
import LoadingDots from '~/assets/img/threeDots.svg?inline'
import { useMarket } from '~/composables/market/useMarket'
export default defineComponent({
  components: {
    LoadingDots,
  },
  fetchOnServer: false,
  props: {
    resource: {
      type: Object,
      required: true,
    },
  },

  setup(props, context) {
    const { address } = context.root.$route.params
    const { fetchResource, loading, balance } = useResources()
    const { addToMarket } = useMarket()
    useFetch(async () => {
      await fetchResource(address, props.resource.id)
    })
    return {
      fetchResource,
      addToMarket,
      balance,
      loading,
    }
  },
})
</script>
