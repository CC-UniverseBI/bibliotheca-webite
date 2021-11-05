<template>
  <tr class="text-xl font-semibold bg-opacity-85">
    <td class="p-2">
      {{ resource.trait }}
    </td>
    <td class="p-2">
      <span v-if="loading.resources"><LoadingDots class="w-8 h-2" /></span
      ><span v-else>{{ balance }}</span>
    </td>
    <td class="p-2">0</td>
  </tr>
</template>
<script>
import { defineComponent, useFetch } from '@nuxtjs/composition-api'
import { useResources } from '~/composables/resources/useResources'
import LoadingDots from '~/assets/img/threeDots.svg?inline'
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

    useFetch(async () => {
      await fetchResource(address, props.resource.id)
    })
    return {
      fetchResource,
      balance,
      loading,
    }
  },
})
</script>
