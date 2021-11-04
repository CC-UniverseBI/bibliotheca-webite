<template>
  <NuxtLink :to="'/adventurer/' + address + '/empire'">
    <span v-if="ensName">{{ ensName }}</span>
    <span v-else>{{ shortenHash(address) }}</span>
  </NuxtLink>
</template>

<script>
import { defineComponent, onMounted } from '@vue/composition-api'
import { useFormatting } from '~/composables/useFormatting'
export default defineComponent({
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    const { shortenHash, returnEns, ensName } = useFormatting()
    onMounted(async () => {
      await returnEns(props.address)
    })
    return {
      shortenHash,
      ensName,
    }
  },
})
</script>
