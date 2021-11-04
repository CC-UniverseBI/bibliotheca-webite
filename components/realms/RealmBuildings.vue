<template>
  <div
    class="my-1 flex justify-between"
    @mouseover="getBuildingStats(buildingId)"
  >
    <span class="flex">
      <!-- <span
        v-if="output"
        class="border border-gray-800 rounded p-1 text-xs mr-2"
        >1</span
      > -->
      <span class="self-center">
        <span
          >{{ findBuilding.name }}:
          <span class="font-semibold">{{ building }}</span> /
          <span v-if="getConstraint" class="text-gray-400">{{
            getConstraint.value
          }}</span></span
        >
        <!-- <span v-else class="flex"
          >{{ findBuilding(building).name }}: <LoadingDots class="w-5"
        /></span> -->
      </span>
    </span>
    <v-popover v-if="isAddressPage" placement="right" trigger="hover">
      <Web3Button
        type="small"
        :disabled="loading.building"
        @click="constructBuilding(realmId, buildingId, stats[1], stats[2])"
      >
        {{ loading.building ? 'Building..' : 'Build' }}
      </Web3Button>

      <template slot="popover">
        <div class="bg-gray-300 shadow-xl p-4 rounded text-black z-50">
          <h4 class="text-center mb-1">Building Cost</h4>

          <div v-if="stats" class="flex justify-between capitalize">
            <div class="flex flex-col capitalize">
              <span
                v-for="(cost, index) in stats[1]"
                :key="index"
                class="pr-3 capitalize"
                ><span
                  :class="findResources(cost).colourClass"
                  class="rounded-full p-2 mr-1 bg-opacity-75"
                ></span
                >{{ findResources(cost).trait }}:</span
              >
              <hr class="my-2" />
              <span>Population: </span>
              <span class="pr-4">Food Supply: </span>
              <hr class="my-2" />
              <span>Defence: </span>
              <span>Offence:</span>
              <span>Magic:</span>
            </div>

            <div class="flex flex-col">
              <span v-for="(cost, index) in stats[2]" :key="index">{{
                cost
              }}</span>
              <hr class="my-2" />
              <span
                ><span v-if="stats[7] > 0">+{{ stats[7] }}</span
                ><span v-else>{{ stats[7] }}</span></span
              >
              <span
                ><span v-if="stats[8] > 0">+{{ stats[8] }}</span
                ><span v-else>{{ stats[8] }}</span></span
              >
              <hr class="my-2" />

              <span>{{ stats[4] }}</span>
              <span>{{ stats[5] }}</span>
              <span>{{ stats[6] }}</span>
            </div>
          </div>
        </div>
      </template>
    </v-popover>
  </div>
</template>
<script>
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { allBuildings } from '@/composables/utils/buildings'
import { useConstruction } from '~/composables/construction/useConstruction'
import { resources } from '@/composables/utils/resourceColours'
import { useConnect } from '~/composables/web3/useConnect'

export default defineComponent({
  props: {
    building: {
      type: Number,
      required: true,
    },
    realmId: {
      type: String,
      required: true,
    },
    buildingId: {
      type: Number,
      required: true,
    },
    realmTraits: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const {
      constructBuilding,
      getBuildings,
      getCosts,
      getBuildingStats,
      stats,
      costs,
      buildings,
      loading,
      error,
      result,
    } = useConstruction()
    const { isAddressPage } = useConnect()
    const findBuilding = computed(() => {
      return allBuildings.find((a) => a.id === parseInt(props.buildingId))
    })
    const findResources = (resource) => {
      return resources.find((a) => a.id === parseInt(resource))
    }
    const getConstraint = computed(() => {
      return props.realmTraits.find((a) => a.name === findBuilding.value.trait)
    })
    return {
      findBuilding,
      constructBuilding,
      getBuildings,
      findResources,
      getCosts,
      costs,
      getBuildingStats,
      stats,
      buildings,
      loading,
      error,
      result,
      getConstraint,
      isAddressPage,
    }
  },
})
</script>
