<template>
  <div class="pt-2 pr-2">
    <span
      :class="getColour(checkRealmRarity(traits).toFixed(2))"
      class="bg-white rounded-xl px-3 py-1"
      >Rarity: {{ checkRealmRarity(traits).toFixed(2) }}</span
    >
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'
import { useRarity } from '~/composables'
export default defineComponent({
  props: {
    traits: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const { checkRealmRarity } = useRarity()

    const getColour = (rarity) => {
      if (rarity > 8000) {
        return 'bg-gradient-to-r from-purple-200 via-pink-400 to-red-400'
      } else if (rarity > 200) {
        return 'bg-red-800 text-white'
      } else if (rarity > 100) {
        return 'bg-red-600 text-white'
      } else if (rarity > 50) {
        return 'bg-red-400 text-white'
      } else if (rarity > 25) {
        return 'bg-red-200 text-white text-gray-700'
      } else if (rarity > 10) {
        return 'bg-red-50 text-gray-700'
      } else {
        return 'text-black'
      }
    }
    return {
      checkRealmRarity,
      getColour,
    }
  },
})
</script>
