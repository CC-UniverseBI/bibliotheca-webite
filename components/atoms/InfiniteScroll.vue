<template>
  <div>
    <slot />
  </div>
</template>

<script>
import { defineComponent, toRefs, watch } from '@vue/composition-api'
import { onBeforeUnmount, onMounted } from '@nuxtjs/composition-api'

const DEFAULT_LOAD_GAP = 400
export default defineComponent({
  props: {
    contentChangeKey: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { contentChangeKey } = toRefs(props)
    let locked = false
    const loadGap = DEFAULT_LOAD_GAP

    watch(contentChangeKey, () => {
      locked = false
    })

    onMounted(() => {
      window.addEventListener('scroll', fetchNextBlockIfNeeded)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', fetchNextBlockIfNeeded)
    })

    function fetchNextBlockIfNeeded(e) {
      const div = e.target.documentElement
      const divGap = div.scrollHeight - div.clientHeight - div.scrollTop
      if (divGap < loadGap) {
        if (!locked) {
          locked = true
          emit('fetchNextBlock')
        }
      }
    }
    return {
      fetchNextBlockIfNeeded,
    }
  },
})
</script>

<style scoped></style>
