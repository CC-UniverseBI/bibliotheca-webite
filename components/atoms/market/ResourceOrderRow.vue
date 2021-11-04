<template>
  <tr class="text-l font-semibold bg-opacity-85">
    <td class="p-2">
      {{ resource.trait }}
    </td>
    <td class="p-2">
      <span v-if="loading.resources"><LoadingDots class="w-8 h-2" /></span
      ><span v-else>{{ balance }}</span>
    </td>
    <td class="py-2">
      <input
        class="text-right appearance-none rounded-2xl bg-gray-1000 w-3/4 p-1"
        type="number"
        placeholder="0"
        @change.prevent="$emit('amount-changed', $event)"
      />
    </td>
    <td>
      <button type="button" @click="$emit('x-click')">
        <Close />
      </button>
    </td>
  </tr>
</template>
<script>
import { useFetch, defineComponent, ref } from '@nuxtjs/composition-api'
import { useMarket } from '~/composables/market/useMarket'
import { useResources } from '~/composables/resources/useResources'
import LoadingDots from '~/assets/img/threeDots.svg?inline'
import Close from '~/assets/img/x-square.svg?inline'

export default defineComponent({
  components: {
    LoadingDots,
    Close,
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
    const { fetchResourceSupply, fetchCurrencyReserve, loading } = useMarket()
    const { fetchResource } = useResources()

    const reserve = ref()
    const supply = ref()
    const balance = ref()

    useFetch(async () => {
      reserve.value = await fetchCurrencyReserve(props.resource.id)
      supply.value = await fetchResourceSupply(props.resource.id)
      balance.value = await fetchResource(address, props.resource.id)
    })
    return {
      reserve,
      supply,
      balance,
      loading,
    }
  },
})
</script>
