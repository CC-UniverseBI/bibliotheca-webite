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
              <RaiderResultsTableRow
                v-for="result in results"
                :key="result.id"
                :result="result"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    results: {
      type: Array,
      default: null,
    },
  },
}
</script>
