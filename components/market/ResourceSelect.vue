<template>
  <div class="flex bg-gray-900 justify-between p-4 rounded-2xl w-full mb-4">
    <div class="w-full pr-9">
      <div
        :class="resource.colourClass"
        class="p-3 rounded-xl font-display text-xl bg-opacity-75 border"
      >
        {{ resource.trait }}
      </div>
      <div class="mt-2 text-sm text-gray-200 px-2">
        Balance: {{ resource.balance }}
        <button
          class="text-red-500 font-body font-semibold"
          @click="selectMax(resource.balance)"
        >
          (MAX)
        </button>
      </div>
    </div>
    <div class="flex flex-col justify-between w-1/3">
      <div class="text-2xl mt-2 flex ml-auto">
        <input
          v-model="amount"
          min="0"
          class="
            text-right
            appearance-none
            bg-transparent
            w-full
            focus:outline-none focus:border-none
          "
          type="number"
          placeholder="0"
          @change.prevent="onAmountChanged(resource, amount)"
        />
      </div>
      <span class="text-right text-gray-500">rate: {{ calculatedRate }}</span>
      <div class="text-sm ml-auto">
        <button
          class="hover:bg-gray-800 rounded px-2"
          type="button"
          @click="addToMarket(resource)"
        >
          remove
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import { ethers } from 'ethers'
import { useMarket } from '~/composables/market/useMarket'
export default defineComponent({
  props: {
    resource: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { addToMarket, onAmountChanged, fetchResourcePrice } = useMarket()
    const amount = ref(0)

    const resourcePrice = ref()

    const selectMax = (max) => {
      amount.value = max
      onAmountChanged(props.resource, amount.value)
    }

    const fetchRate = async () => {
      resourcePrice.value = parseInt(
        ethers.utils.formatEther(
          await fetchResourcePrice(props.resource.id, amount.value)
        )
      ).toFixed(2)
    }

    watch(amount, async () => {
      await fetchRate()
    })

    const calculatedRate = computed(() => {
      return (resourcePrice.value / amount.value).toFixed(2)
    })

    return {
      addToMarket,
      onAmountChanged,
      amount,
      selectMax,
      resourcePrice,
      calculatedRate,
    }
  },
})
</script>
