<template>
  <span class="w-full flex">
    <span
      v-if="order"
      class="rounded w-full px-4 py-2"
      :style="'background:' + getOrder.colour"
      >{{ order }}</span
    >
    <span
      v-if="orderId"
      class="px-4 py-2 rounded"
      :style="'background:' + getOrderById.colour"
      >Order of {{ getOrderById.name }}</span
    >
  </span>
</template>
<script>
import { computed, defineComponent } from '@vue/composition-api'
import { gaOrders } from '~/composables/ordersData'
export default defineComponent({
  props: {
    order: {
      type: String,
      required: false,
      default: null,
    },
    orderId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const getOrder = computed(() => {
      if (props.order) {
        return gaOrders.find((a) => props.order.includes(a.name))
      }
      return null
    })
    const getOrderById = computed(() => {
      return gaOrders.find((a) => props.orderId === a.id)
    })
    return {
      getOrder,
      getOrderById,
    }
  },
})
</script>
