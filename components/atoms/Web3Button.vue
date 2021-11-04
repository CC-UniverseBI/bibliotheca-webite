<template>
  <component
    :is="tag"
    class="button ease-in-out font-display text-center disabled:opacity-25"
    :class="[buttonColor]"
    v-bind="$attrs"
    :disabled="disabled"
    :to="to"
    v-on="$listeners"
  >
    <slot v-if="!loading" />
    <span v-else><LoadingRings class="mx-auto w-7 h-7" /></span>
  </component>
</template>
<script>
import { defineComponent, computed } from '@nuxtjs/composition-api'
import { ButtonColors } from '@/validators/Button'
import { useConnect } from '~/composables/web3/useConnect'
import LoadingRings from '~/assets/img/loadingRings.svg?inline'
export default defineComponent({
  components: {
    LoadingRings,
  },
  props: {
    to: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    href: {
      type: String,
      default: null,
    },
    block: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      required: false,
      type: String,
      default: 'default',
      validator: (value) => {
        return Object.keys(ButtonColors).includes(value)
      },
    },
  },
  setup(props) {
    const { isAddressPage } = useConnect()
    const buttonColor = computed(() => {
      return ButtonColors[props.type]
    })

    const tag = computed(() => {
      return props.to ? 'nuxt-link' : 'button'
    })
    return {
      buttonColor,
      tag,
      isAddressPage,
    }
  },
})
</script>
