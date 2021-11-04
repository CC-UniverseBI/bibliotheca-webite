<template>
  <div class="flex bg-gray-900 justify-between p-4 rounded-2xl w-full">
    <div class="w-full pr-9">
      <div class="bg-gray-700 p-2 rounded-xl font-display text-xl">Gold</div>
      <div class="mt-2 text-sm">Balance:</div>
    </div>
    <div class="flex flex-col justify-between">
      <div class="text-2xl">0.0</div>
      <div class="text-sm">remove</div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    resource: {
      type: Object,
      required: true,
    },
  },
  setup() {},
})
</script>
