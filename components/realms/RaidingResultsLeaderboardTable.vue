<template>
  <div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div
          class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-800">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left uppercase tracking-wider"
                >
                  <span v-if="type === 'raid'">Raider</span>
                  <span v-else>Defender</span>
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-center uppercase tracking-wider"
                >
                  Raids
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-center uppercase tracking-wider"
                >
                  Units Killed
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-center uppercase tracking-wider"
                >
                  Units Lost
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody
              v-if="results && !loading"
              class="bg-gray-900 divide-y divide-gray-200"
            >
              <tr v-for="(result, index) in results" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="">
                      <div class="text-2xl font-semibold">
                        <span v-if="index === 0">👑</span>
                        <NuxtLink
                          :to="
                            '/adventurer/' + result.address + '/raid-results'
                          "
                        >
                          <Ens :address="result.address" />
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="
                      p-4
                      inline-flex
                      text-2xl
                      mx-auto
                      leading-5
                      font-semibold
                      rounded-full
                      bg-green-100
                      text-green-800
                    "
                  >
                    <span v-if="type === 'raid'">{{ result.raidAttacks }}</span>
                    <span v-else>{{ result.raidDefends }}</span>
                  </span>
                </td>
                <td class="px-6 py-4 text-2xl">
                  <div>
                    <span v-if="type === 'raid'">{{
                      getUnitsKilled(result)
                    }}</span>
                    <span v-else>{{ getUnitsLost(result) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-2xl">
                  <span v-if="type === 'raid'">{{ getUnitsLost(result) }}</span>
                  <span v-else>{{ getUnitsKilled(result) }}</span>
                </td>
                <td
                  class="
                    px-6
                    py-4
                    whitespace-nowrap
                    text-right text-sm
                    font-medium
                  "
                >
                  <BButton
                    type="primary"
                    :to="'/adventurer/' + result.address + '/raid-results'"
                    >View Lord
                  </BButton>
                </td>
              </tr>
            </tbody>
            <span v-else
              ><LoadingRings class="mx-auto w-24 h-24 mr-8" />Not
              Implemented</span
            >
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import LoadingRings from '~/assets/img/loadingRings.svg?inline'

// import { computed } from '@nuxtjs/composition-api'
export default {
  components: {
    LoadingRings,
  },
  props: {
    results: {
      type: Array,
      default: null,
    },
    type: {
      type: String,
      default: 'raid',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const getTime = (timestamp) => {
      return dayjs.unix(timestamp).format('DD MMM YYYY HH:mm:ss')
    }
    const typeResult = () => {
      return props.type === 'defend' ? 'defenderResults' : 'raiderResults'
    }
    const getUnitsLost = (result) => {
      return result[typeResult()]?.reduce(function (accumulator, item) {
        return accumulator + parseInt(item.raiderUnitsLost)
      }, 0)
    }
    const getUnitsKilled = (result) => {
      return result[typeResult()]?.reduce(function (accumulator, item) {
        return accumulator + parseInt(item.defenderUnitsLost)
      }, 0)
    }
    return {
      getUnitsLost,
      getUnitsKilled,
      getTime,
    }
  },
}
</script>
