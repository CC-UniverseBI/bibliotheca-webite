<template>
  <div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div
          class="shadow overflow-hidden border-b border-gray-800 sm:rounded-lg"
        >
          <table class="min-w-full divide-y">
            <thead class="bg-gray-900 text-gray-300">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left uppercase tracking-wider"
                >
                  Raiding Realm
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left uppercase tracking-wider"
                >
                  Defending Realm
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left uppercase tracking-wider"
                >
                  Dice Roll
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left uppercase tracking-wider"
                >
                  Time
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left uppercase tracking-wider"
                >
                  Resources Pillaged
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-gray-900 divide-y divide-gray-200 text-white">
              <tr v-for="result in results" :key="result.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="">
                      <div class="text-xl font-display">
                        Realm ID: {{ result.raiderRealm.id }}
                      </div>
                      <div>Raider: {{ result.raider.id }}</div>
                      <div class="text-red-600 font-semibold">
                        Units Lost: {{ result.raiderUnitsLost }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-xl font-display">
                    Realm ID: {{ result.defenderRealm.id }}
                  </div>
                  <div>
                    {{ result.defender.id }}
                  </div>
                  <div class="text-red-600 font-semibold">
                    Units Lost: {{ result.defenderUnitsLost }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-green-100 text-green-800':
                        result.resourcesPillaged.length,
                    }"
                    class="
                      p-4
                      inline-flex
                      text-2xl
                      leading-5
                      font-semibold
                      rounded-full
                      bg-red-100
                      text-red-800
                    "
                  >
                    {{ result.result }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ getTime(result.timestamp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="result.resourcesPillaged.length">
                    <SuccessfulRaidedResource
                      v-for="(resource, index) in result.resourcesPillaged"
                      :key="index"
                      :resource="resource.id"
                      vault="1"
                      :value="result.resourcesValuesPillaged[index]"
                      class="my-1 flex justify-between rounded font-semibold"
                    />
                  </div>
                  <div v-else class="px-6 py-4 whitespace-nowrap font-semibold">
                    Raid Unsuccessful
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  props: {
    results: {
      type: Object,
      default: null,
    },
  },
  setup() {
    const getTime = (timestamp) => {
      return dayjs.unix(timestamp).format('DD MMM YYYY HH:mm:ss')
    }
    return {
      getTime,
    }
  },
}
</script>
