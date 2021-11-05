<template>
  <vue-good-table :columns="columns" :rows="rows" />
</template>
<script>
import { defineComponent, ref, useFetch } from '@nuxtjs/composition-api'
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
  fetchOnServer: false,
  props: {
    resources: {
      type: Array,
      required: true,
    },
  },

  setup(props, context) {
    const { columns } = data
    const { resources } = props
    const { allUsersResources, fetchUsersBalance } = useResources()
    const {
      fetchUserTokenValues,
      fetchAllTokenPrices,
      allUserTokenValues,
      allTokenPrices,
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
    useFetch(async () => {
      await fetchAllTokenPrices()
      await fetchUserTokenValues()
      await fetchUsersBalance()
      switch (selectedViewType.value) {
        default:
          rows.value = filteredResources.map((e, i) => {
            return {
              id: i,
              name: e.trait,
              price: allTokenPrices.value[i].price,
              balance: allUsersResources.value[i].balance,
              value: allUserTokenValues.value[i].value,
            }
          })
          break
      }
    })

    return {
      balance,
      rows,
      columns,
    }
  },
})
</script>
