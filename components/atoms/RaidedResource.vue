<template>
  <div class="my-1 flex justify-between">
    <span class="flex">
      <span
        v-if="getOutputLevel"
        :class="findResources.colourClass"
        class="rounded p-1 mr-2 bg-opacity-75"
        >{{ resourceLevel }}</span
      >
      <span class="self-center">
        <span v-if="!loading.resources"
          >{{ findResources.trait }}:
          {{ getOutputLevel * vault }}
        </span>
        <span v-else class="flex"
          >{{ findResources.trait }}: <LoadingDots class="w-5"
        /></span>
      </span>
    </span>
  </div>
</template>
<script>
import { defineComponent, computed } from '@nuxtjs/composition-api'
import { resources } from '@/composables/utils/resourceColours'
import { useResources } from '~/composables/resources/useResources'
import { useConnect } from '~/composables/web3/useConnect'
import { productionOutput } from '@/composables/utils/productionOutput'
import LoadingDots from '~/assets/img/threeDots.svg?inline'
export default defineComponent({
  components: {
    LoadingDots,
  },
  props: {
    resource: {
      type: Object,
      required: true,
    },
    realmId: {
      type: String,
      required: true,
    },
    vault: {
      type: Number,
      required: true,
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
      return props.resource ? props.resource.id.split('-')[1] : null
    })

    const resourceLevel = computed(() => {
      return props.resource.level > 0 ? parseInt(props.resource.level) + 1 : 1
    })

    const getOutputLevel = computed(() => {
      return productionOutput.find(
        (a) => a.level === parseInt(resourceLevel.value)
      ).output
    })

    const findResources = computed(() => {
      return resources.find((a) => a.id === parseInt(resourceId.value))
    })

    const findCostResources = (id) => {
      return resources.find((a) => a.id === parseInt(id))
    }

    // useFetch(async () => {
    //   await fetchProductionOutput(props.realmId, props.resource.id)
    // })

    return {
      findCostResources,
      getOutputLevel,
      resourceLevel,
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
