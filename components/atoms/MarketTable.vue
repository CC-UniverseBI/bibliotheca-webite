<template>
  <table class="table-fixed">
    <thead>
      <tr class="text-xl text-left">
        <th class="w-1/2">Resource</th>
        <th class="w-1/4">Balance</th>
        <th class="w-1/4 text-center">Add</th>
      </tr>
    </thead>
    <tbody>
      <ResourceRow
        v-for="(resource, index) in rows"
        :key="index"
        class="even:bg-gray-900 rounded-lg"
        :resource="resource"
      />
    </tbody>
  </table>
  <!-- <vue-good-table
    style-class="bg-black text-xl p-4 rounded"
    :columns="columns"
    :rows="rows"
    @on-row-click="addToMarket"
  /> -->
</template>
<script>
import { defineComponent, onMounted, ref } from '@nuxtjs/composition-api'
// import { ethers } from 'ethers'
import { useResources } from '~/composables/resources/useResources'
import { useMarket } from '~/composables/market/useMarket'
const data = {
  columns: [
    {
      label: 'Resource',
      field: 'name',
      type: 'string',
    },
    {
      label: 'Price',
      field: 'price',
    },
    {
      label: 'Balance',
      field: 'balance',
    },
    {
      label: 'Value',
      field: 'value',
    },
  ],
}
export default defineComponent({
  props: {
    resources: {
      type: Array,
      required: true,
    },
  },
  fetchOnServer: false,
  setup(props, context) {
    const { columns } = data
    const { resources } = props
    const { allUsersResources } = useResources()
    const {
      fetchUserTokenValues,
      fetchAllTokenPrices,
      // allUserTokenValues,
      // allTokenPrices,
      addToMarket,
    } = useMarket()
    const viewTypes = [
      {
        data: 'overview',
        name: 'overview',
      },
      {
        data: 'holdings',
        name: 'holdings',
      },
      {
        data: 'price_action',
        name: 'price action',
      },
    ]
    const selectedViewType = ref(viewTypes[0])
    const balance = ref()
    const rows = ref([])
    const filteredResources = resources.filter((d) => {
      return d.value > 1
    })
    onMounted(async () => {
      await fetchUserTokenValues()
      await fetchAllTokenPrices()
      switch (selectedViewType.value) {
        default:
          rows.value = filteredResources.map((e, i) => {
            return {
              id: e.id,
              trait: e.trait,
              // price: parseInt(
              //   ethers.utils.formatEther(allTokenPrices.value[i].price)
              // ).toFixed(2),
              balance: allUsersResources.value[i].balance,
              // value: parseInt(
              //   ethers.utils.formatEther(allUserTokenValues.value[i].value)
              // ).toFixed(2),
              colourClass: e.colourClass,
            }
          })
          break
      }
    })

    return {
      balance,
      rows,
      columns,
      addToMarket,
    }
  },
})
</script>
