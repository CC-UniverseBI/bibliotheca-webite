<template>
  <div
    class="my-1 flex justify-between"
    @mouseover="fetchUpgradeCost(resourceId, resourceLevel)"
  >
    <span v-if="resource" class="flex">
      <span
        :class="findResources.colourClass"
        class="rounded p-1 text-sm mr-2 bg-opacity-75"
        >{{ resourceLevel }}</span
      >
      <span class="self-center">
        <span v-if="!loading.resources"
          >{{ findResources.trait }}: {{ getOutputLevel }}</span
        >
        <span v-else class="flex"
          >{{ findResources.trait }}: <LoadingDots class="w-5"
        /></span>
      </span>
    </span>
    <v-popover
      v-if="resource && isAddressPage"
      placement="right"
      trigger="hover"
    >
      <Web3Button
        type="small"
        :disabled="!upgradeCosts"
        @click="upgradeResource(realmId, resourceId, resourceLevel)"
      >
        {{ loading.resources ? 'Upgrading...' : 'Upgrade' }}
      </Web3Button>

      <template slot="popover">
        <div class="bg-gray-300 shadow-xl p-4 rounded text-gray-900">
          <h4 class="text-center mb-1">Upgrade Cost</h4>
          <p class="text-center mb-4">
            This will increase production <br />
            to <span class="font-semibold">{{ getNextOutputLevel }}</span> per
            day
          </p>
          <div v-if="upgradeCosts" class="flex justify-between">
            <div class="flex flex-col">
              <span
                v-for="(cost, index) in upgradeCosts[0]"
                :key="index"
                class="pr-3"
              >
                <span
                  :class="findCostResources(cost).colourClass"
                  class="rounded-full p-2 mr-1 bg-opacity-75 border"
                ></span
                >{{ findCostResources(cost).trait }}:</span
              >
            </div>

            <div class="flex flex-col">
              <span v-for="(cost, index) in upgradeCosts[1]" :key="index">{{
                cost
              }}</span>
            </div>
          </div>
        </div>
      </template>
    </v-popover>
  </div>
</template>
<script>
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { resources } from '@/composables/utils/resourceColours'
import { productionOutput } from '@/composables/utils/productionOutput'
import { useResources } from '~/composables/resources/useResources'
import { useConnect } from '~/composables/web3/useConnect'
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
  },
  setup(props) {
    const { isAddressPage } = useConnect()
    const {
      fetchUpgradeCost,
      fetchProductionOutput,
      upgradeResource,
      upgradeCosts,
      loading,
      output,
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

    const getNextOutputLevel = computed(() => {
      return productionOutput.find(
        (a) => a.level === parseInt(resourceLevel.value + 1)
      ).output
    })

    const findResources = computed(() => {
      return resources.find((a) => a.id === parseInt(resourceId.value))
    })

    const findCostResources = (id) => {
      return resources.find((a) => a.id === parseInt(id))
    }

    return {
      findResources,
      findCostResources,
      fetchProductionOutput,
      fetchUpgradeCost,
      upgradeResource,
      getOutputLevel,
      resourceId,
      resourceLevel,
      upgradeCosts,
      loading,
      output,
      isAddressPage,
      getNextOutputLevel,
    }
  },
})
</script>
