<template>
  <tr class="text-xl font-semibold bg-opacity-85">
    <td class="p-2">
      {{ resource.trait }}
    </td>
    <td class="p-2">
      <span>{{ resource.balance }}</span>
    </td>
    <td class="p-2">0</td>
  </tr>
</template>
<script>
import { defineComponent } from '@nuxtjs/composition-api'
export default defineComponent({
  fetchOnServer: false,
  props: {
    resource: {
      type: Object,
      required: true,
    },
  },

  setup(props, context) {},
})
</script>
