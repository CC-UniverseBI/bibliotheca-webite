<template>
  <div class="flex justify-between my-1" @mouseover="fetchUnitCost(unitId)">
    <div>
      {{ unitValues.name }}: <span class="font-semibold">{{ unit }}</span>
      <span class="text-gray-400 text-sm"
        >{{ unitValues.offence * unit }}|{{ unitValues.defence * unit }}</span
      >
    </div>
    <v-popover placement="right" trigger="hover">
      <div v-if="isAddressPage" class="flex">
        <Web3Button
          type="small"
          :disabled="!unitCost"
          @click="buildRaiding(realmId, unitId, qty, unitCost[0], unitCost[1])"
        >
          {{ loading.buildRaiding ? 'Building..' : 'Build' }}
        </Web3Button>
      </div>

      <template slot="popover">
        <div class="bg-gray-300 shadow-xl p-4 rounded-2xl text-black z-50 w-64">
          <h3 class="text-center mb-1">{{ unitValues.name }}</h3>
          <div class="pb-2">
            {{ unitValues.description }}
          </div>
          <div v-if="maxArmy" class="text-center">
            Total Max Units: {{ maxArmy }}
          </div>
          <div class="mx-auto flex justify-center">
            <button
              class="px-2 bg-gray-100 rounded hover:bg-gray-200"
              @click="qty--"
            >
              -
            </button>
            <input
              v-model="qty"
              type="number"
              min="1"
              max="10"
              class="w-9 rounded bg-gray-300 text-center hover:bg-gray-200"
            />
            <button class="px-2 bg-gray-100 rounded" @click="qty++">+</button>
          </div>
          <div v-if="isAddressPage" class="flex my-2 justify-center">
            <Web3Button
              type="small"
              class="w-full hover:text-white"
              :disabled="!unitCost"
              @click="
                buildRaiding(realmId, unitId, qty, unitCost[0], unitCost[1])
              "
            >
              {{ loading.buildRaiding ? 'Building..' : 'Build Unit' }}
            </Web3Button>
          </div>
          <div class="my-3">
            Offence:
            <span class="font-semibold">+{{ unitValues.offence }}</span> <br />
            Defence:
            <span class="font-semibold">+{{ unitValues.defence }}</span>
          </div>
          <div v-if="unitCost" class="flex justify-between capitalize">
            <div class="flex flex-col capitalize">
              <span
                v-for="(cost, index) in unitCost[0]"
                :key="index"
                class="pr-3 capitalize"
                ><span
                  :class="findResources(cost).colourClass"
                  class="rounded-full p-2 mr-1 bg-opacity-75"
                ></span
                >{{ findResources(cost).trait }}:</span
              >
            </div>
            <div class="flex flex-col">
              <span v-for="(cost, index) in unitCost[1]" :key="index"
                >{{ cost * qty }} /
                <span>{{
                  findResources(unitCost[0][index]).balance
                }}</span></span
              >

              <hr class="my-2" />
            </div>
          </div>
        </div>
      </template>
    </v-popover>
  </div>
</template>
<script>
// import { useFetch } from '@nuxtjs/composition-api'
import { computed, defineComponent, ref } from '@vue/composition-api'
import { militaryUnits } from '@/composables/utils/militaryUnits'
import { useMilitary } from '~/composables/military/useMilitary'
import { useResources } from '~/composables/resources/useResources'

import { useConnect } from '~/composables/web3/useConnect'
export default defineComponent({
  props: {
    unit: {
      type: Object,
      required: true,
    },
    realmId: {
      type: String,
      required: true,
    },
    unitId: {
      type: Number,
      required: true,
    },
    time: {
      type: Object,
      required: true,
    },
    maxArmy: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const { allUsersResources } = useResources()
    const {
      buildRaiding,
      fetchUnitCost,
      unitCost,
      raidingArmy,
      error,
      loading,
      result,
    } = useMilitary()
    const { isAddressPage } = useConnect()
    const unitValues = computed(() => {
      return militaryUnits.find((a) => a.id === parseInt(props.unitId))
    })
    const findResources = (resource) => {
      return allUsersResources.value.find((a) => a.id === parseInt(resource))
    }
    const qty = ref(1)

    return {
      qty,
      unitCost,
      fetchUnitCost,
      buildRaiding,
      findResources,
      raidingArmy,
      error,
      loading,
      result,
      unitValues,
      isAddressPage,
      allUsersResources,
    }
  },
})
</script>
