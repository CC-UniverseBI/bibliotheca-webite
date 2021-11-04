<template>
  <div class="w-full">
    <span v-if="raidResults.resourcesIdsPillaged.length" class="text-green-400"
      >Raid successful!!</span
    >

    <span v-else class="text-red-400">You have failed</span>
    <h2>Raid Results</h2>
    <hr />
    <h3 class="mt-4">{{ attackingRealm.name }}</h3>
    <div>Units Lost: {{ raidResults.raidingUnitsLost }}</div>
    <div>Units Captured: {{ raidResults.unitsCaptured }}</div>
    <div v-if="raidResults.resourcesIdsPillaged.length">
      <div class="mt-2">Resources Pillaged:</div>
      <SuccessfulRaidedResource
        v-for="(resource, index) in raidResults.resourcesIdsPillaged"
        :key="index"
        :resource="resource"
        vault="1"
        :value="raidResults.resourcesValuesPillaged[index]"
        class="my-1 flex justify-between rounded p-3 font-semibold"
      />
    </div>
    <div v-else>No resources pillaged</div>
    <hr />
    <h3 class="mt-4">{{ defendingRealm.name }}</h3>
    <div>Units Lost: {{ raidResults.defendingUnitsLost }}</div>

    <br />
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    raidResults: {
      type: Object,
      required: true,
    },
    defendingRealm: {
      type: Object,
      required: true,
    },
    attackingRealm: {
      type: Object,
      required: true,
    },
  },
  setup() {},
})
</script>
