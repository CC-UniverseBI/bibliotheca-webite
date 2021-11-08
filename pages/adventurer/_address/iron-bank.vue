<template>
  <div class="container flex">
    <div class="bg-black p-6 rounded-2xl w-1/2 shadow-2xl">
      <h2 class="uppercase text-red-400 text-center">The Iron Bank</h2>
      <!-- <span>
        <span class="text-3xl">
          <span v-if="goldBalance" class="text-yellow-400">{{
            goldBalance
          }}</span>
          <span v-else>...</span>
          Adventurers Gold</span
        >
        <br />
        <span class="text-xl text-gray-400"
          >${{
            (usersGold * goldPrice)
              .toFixed(2)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }}
          USD
        </span>
      </span> -->
      <br />
      <span v-if="lordsBalanceFormatted" class="text-3xl"
        >LORDS: {{ lordsBalanceFormatted }} 👑
      </span>
      <table class="table-fixed w-full">
        <thead>
          <tr class="text-xl text-left">
            <th class="w-1/2">Resource</th>
            <th class="w-1/4">Balance</th>
            <th class="w-1/4">Production p/day</th>
          </tr>
        </thead>
        <tbody v-if="sortedResources">
          <ResourceRow
            v-for="(resource, index) in sortedResources"
            :key="index"
            class="even:bg-gray-900 rounded-lg"
            :resource="resource"
          />
        </tbody>
        <tbody v-else>
          <span><LoadingDots class="w-8 h-2" /></span>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import {
  defineComponent,
  computed,
  useFetch,
  onMounted,
} from '@nuxtjs/composition-api'
import { useLords } from '~/composables/lords/useLords'
import { usePrice } from '~/composables'
import LoadingDots from '~/assets/img/threeDots.svg?inline'

import { useResources } from '~/composables/resources/useResources'
export default defineComponent({
  fetchOnServer: false,
  components: {
    LoadingDots,
  },
  setup(props, context) {
    const { goldPrice } = usePrice()
    const { address } = context.root.$route.params
    const { worldAge, error, goldBalance, getAdventurersGold } = useLords()
    const { fetchUsersBalance, resourceBalance, lordsBalance } = useResources()
    const filteredResources = computed(() => {
      if (resourceBalance.value) {
        return resourceBalance.value.filter((d) => {
          return d.value > 1
        })
      } else {
        return []
      }
    })
    const lordsBalanceFormatted = computed(() => {
      if (lordsBalance.value) {
        return parseFloat(lordsBalance.value)?.toFixed(2)
      }
    })
    const sortedResources = computed(() => {
      return filteredResources.value.sort((a, b) => {
        return b.value - a.value
      })
    })
    onMounted(async () => {
      if (!resourceBalance.value) {
        await fetch()
      }
    })
    useFetch(async () => {
      console.log('fetching ' + address)
      await fetchUsersBalance(address)
      // await getAdventurersGold(address)
    })
    return {
      filteredResources,
      resourceBalance,
      lordsBalance,
      lordsBalanceFormatted,
      worldAge,
      sortedResources,
      error,
      goldBalance,
      getAdventurersGold,
      goldPrice,
    }
  },
})
</script>
