<template>
  <div>
    <span v-if="findResources" class="flex">
      <div
        :class="findResources.colourClass"
        class="w-4 h-6 rounded mr-4"
      ></div>
      <span
        >{{ findResources.trait }}:
        <span v-if="!value">{{ getOutputLevel * vault }}</span>
        <span v-else>{{ value }}</span>
      </span>
    </span>
  </div>
</template>
<script>
import { defineComponent, computed } from '@nuxtjs/composition-api'
import { resources } from '@/composables/utils/resourceColours'
import { useResources } from '~/composables/resources/useResources'
import { useConnect } from '~/composables/web3/useConnect'

export default defineComponent({
  props: {
    resource: {
      type: Object,
      required: true,
    },
    vault: {
      type: String,
      required: true,
    },
    value: {
      type: Object,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const { isAddressPage } = useConnect()
    const {
      fetchUpgradeCost,
      fetchProductionOutput,
      upgradeResource,
      upgradeCosts,
      loading,
    } = useResources()

    const resourceId = computed(() => {
      return props.resource
    })

    const findResources = computed(() => {
      return resources.find((a) => a.id === parseInt(resourceId.value))
    })

    return {
      findResources,
      fetchProductionOutput,
      fetchUpgradeCost,
      upgradeResource,
      upgradeCosts,
      loading,
      isAddressPage,
    }
  },
})
</script>
