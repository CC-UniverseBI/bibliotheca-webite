<template>
  <component
    :is="tag"
    class="button ease-in-out font-display disabled:opacity-25"
    :class="[buttonColor]"
    v-bind="$attrs"
    :disabled="disabled"
    :to="to"
    v-on="$listeners"
    @click="externalSite()"
  >
    <slot v-if="!loading" />
    <span v-else><LoadingRings class="mx-auto w-7 h-7" /></span>
  </component>
</template>
<script>
import { ButtonColors } from '@/validators/Button'
import LoadingRings from '~/assets/img/loadingRings.svg?inline'
export default {
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
  computed: {
    buttonColor() {
      return ButtonColors[this.type]
    },
    tag() {
      return this.to ? 'nuxt-link' : 'button'
    },
  },
  methods: {
    externalSite() {
      console.log('external site buytton')
      if (this.href) {
        window.location = this.href
      }
    },
  },
}
</script>
