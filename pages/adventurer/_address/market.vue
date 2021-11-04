<template>
  <div class="container flex">
    <div class="bg-grey p-6 rounded-2xl w-3/5 shadow-2xl">
      <h2 class="uppercase text-red-400 text-center">Resource Market</h2>
      <br />
      <table class="table-fixed w-full">
        <thead>
          <tr class="text-xl text-left">
            <th class="w-2/6">Resource</th>
            <th class="w-1/6">Rate</th>
            <th class="w-1/6">Pool</th>
            <th class="w-1/6">Your Share</th>
            <th class="w-1/6"></th>
          </tr>
        </thead>
        <tbody>
          <LiquidityInfoRow
            v-for="(resource, index) in sortedResources"
            :key="index"
            class="even:bg-gray-900 rounded-lg"
            :resource="resource"
            @arrow-click="onArrowClick(resource)"
          />
        </tbody>
      </table>
    </div>

    <div class="w-2/5 flex flex-col">
      <div
        class="
          flex
          p-2
          bg-gray-900
          mb-4
          rounded-2xl
          space-x-4
          text-center
          font-display
          text-xl
        "
      >
        <div :class="{ 'bg-gray-300': active }" class="p-2 w-1/2 rounded-2xl">
          Swap
        </div>
        <div :class="{ 'bg-gray-300': active }" class="p-2 w-1/2 rounded-2xl">
          Merchant LPs
        </div>
      </div>
      <MarketCard>
        <div class="flex">
          <div class="w-1/2">
            <ResourceSelect />
          </div>
          <div class="w-1/2"></div>
        </div>
        <!-- <div class="flex flex-wrap sm:space-x-3 my-3">
          <BButton
            v-for="(data, index) in orderTypes"
            :key="index"
            type="primary"
            :class="{
              'bg-black text-red-300': data.data === selectedOrderType,
            }"
            class="
              px-2
              py-2
              hover:bg-black
              rounded
              capitalize
              hover:text-red-300
            "
            @click="setOrderType(data)"
          >
            {{ data.name }}
          </BButton>
        </div> -->
        <!-- <form>
          <table class="table-fixed w-full">
            <thead>
              <tr class="text-xl text-left">
                <th class="w-2/6">Resource</th>
                <th class="w-1/6">Rate</th>
                <th class="w-2/6">Amount</th>
                <th class="w-1/6"></th>
              </tr>
            </thead>
            <tbody>
              <ResourceOrderRow
                v-for="(resource, index) in selectedResources"
                :key="index"
                class="even:bg-gray-900 rounded-lg"
                :resource="resource"
                @x-click="onArrowClick(resource)"
                @amount-changed="onAmountChanged(resource, $event.target.value)"
              />
            </tbody>
          </table>
          <br />
          <span class="text-3xl">LORDS: ~{{ lordsPrice }} 👑 </span>
          <div class="mt-12 text-center">
            <div class="my-4 flex justify-around">
              <div class="flex">
                <BButton
                  class="bg-gray-900 text-2xl"
                  type="primary"
                  @click.prevent="onOrderSubmit()"
                >
                  {{ selectedOrderType.name }}
                </BButton>
              </div>
            </div>
          </div>
        </form> -->
      </MarketCard>
    </div>
  </div>
</template>
<script>
import { useFetch, defineComponent, ref } from '@nuxtjs/composition-api'
import { resources } from '@/composables/utils/resourceColours'
import { useLords } from '~/composables/lords/useLords'
import { useMarket } from '~/composables/market/useMarket'
import { usePrice } from '~/composables'
export default defineComponent({
  setup(props, context) {
    const { goldPrice } = usePrice()
    const { slug } = context.root.$route.params
    const {
      getAdventurersLords,
      lordsBalance,
      worldAge,
      error,
      goldBalance,
      getAdventurersGold,
    } = useLords()
    const {
      buyTokens,
      sellTokens,
      addLiquidity,
      removeLiquidity,
      fetchBulkResourcePrices,
    } = useMarket()
    const orderTypes = [
      {
        data: 'buy',
        name: 'buy',
      },
      {
        data: 'sell',
        name: 'sell',
      },
      {
        data: 'add_liquidity',
        name: 'add liquidity',
      },
      {
        data: 'remove_liquidity',
        name: 'remove liquidity',
      },
    ]
    const selectedOrderType = ref(orderTypes[0])
    const selectedResources = ref([])
    const lordsPrice = ref(0)

    const filteredResources = resources.filter((d) => {
      return d.value > 1
    })

    const sortedResources = filteredResources.sort((a, b) => {
      return b.value - a.value
    })

    useFetch(async () => {
      await getAdventurersLords(slug)
      // await getAdventurersGold(slug)
    })

    function setOrderType(orderType) {
      selectedOrderType.value = orderType
    }
    function onArrowClick(resource) {
      const i = selectedResources.value.indexOf(resource)
      if (i === -1) {
        selectedResources.value.push(resource)
      } else {
        selectedResources.value.splice(i, 1)
        updateLordsPrice()
      }
    }
    function onXClick(resource) {
      const i = selectedResources.value.indexOf(resource)
      selectedResources.value.splice(i, 1)
      updateLordsPrice()
    }
    function onAmountChanged(resource, amount) {
      const i = selectedResources.value.indexOf(resource)
      selectedResources.value[i].amount = amount
      updateLordsPrice()
    }
    async function updateLordsPrice() {
      const filtered = selectedResources.value.filter((e) => e.amount > 0)
      const ids = filtered.map((e) => e.id)
      const amounts = filtered.map((e) => e.amount)
      const prices = await fetchBulkResourcePrices(ids, amounts)
      const total = prices.reduce((a, b) => a.add(b))
      lordsPrice.value = total
    }
    async function onOrderSubmit() {
      const withAmounts = selectedResources.value.filter((e) => e.amount > 0)
      const resourceIds = withAmounts.map((e) => e.id)
      const resourceAmounts = withAmounts.map((e) => e.amount)
      switch (selectedOrderType.value.data) {
        case 'buy':
          await buyTokens(resourceIds, resourceAmounts)
          break
        case 'sell':
          await sellTokens(resourceIds, resourceAmounts)
          break
        case 'add_liquidity':
          await addLiquidity(resourceIds, resourceAmounts, resourceAmounts)
          break
        case 'remove_liquidity':
          await removeLiquidity(resourceIds, resourceAmounts, resourceAmounts)
          break
      }
    }
    return {
      getAdventurersLords,
      lordsBalance,
      lordsPrice,
      worldAge,
      sortedResources,
      error,
      goldBalance,
      getAdventurersGold,
      goldPrice,
      orderTypes,
      selectedOrderType,
      setOrderType,
      selectedResources,
      onArrowClick,
      onXClick,
      onAmountChanged,
      onOrderSubmit,
    }
  },
})
</script>
