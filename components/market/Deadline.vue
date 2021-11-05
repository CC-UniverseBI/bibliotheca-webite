<template>
  <v-popover trigger="click" placement="left">
    <Cog class="cursor-pointer" />
    <template slot="popover">
      <div class="bg-gray-300 shadow-xl p-4 rounded text-black">
        <h4>Trade Settings</h4>
        <p>Set deadline</p>
      </div>
    </template>
  </v-popover>
</template>
<script>
import { defineComponent } from '@vue/composition-api'
import Cog from '~/assets/img/settings.svg?inline'
export default defineComponent({
  components: {
    Cog,
  },
  setup() {},
})
</script>
