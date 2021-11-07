<template>
  <div class="container flex">
    <!-- <div class="bg-grey p-6 rounded-2xl w-3/5 shadow-2xl">
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
    </div> -->
    <MarketTable :resources="sortedResources" />

    <div class="w-2/5 flex flex-col">
      <div
        v-if="selectedMenu"
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
        <div
          v-for="(item, index) in menu"
          :key="index"
          :class="{
            'bg-gray-800 text-gray-200 shadow': item.data === selectedMenu.data,
          }"
          class="
            p-2
            w-1/2
            rounded-xl
            cursor-pointer
            hover:bg-gray-800
            transition-all
            duration-200
          "
          @click="setActiveMenu(item)"
        >
          {{ item.name }}
        </div>
      </div>
      <MarketCard v-if="selectedMenu.data === 'Swap'">
        <div class="flex flex-wrap">
          <div v-if="!selectedResources.length" class="w-full text-2xl mb-4">
            Select Resources
          </div>
          <div
            :class="{ 'flex-col-reverse': buy }"
            class="w-2/3 flex flex-col transition duration-300"
          >
            <ResourceSelect
              v-for="(resource, index) in selectedResources"
              :key="index"
              class="transition duration-300"
              :resource="resource"
              @x-click="onArrowClick(resource)"
              @amount-changed="onAmountChanged(resource, $event.target.value)"
            />
            <div class="flex my-4">
              <button
                class="
                  rounded-full
                  mx-auto
                  text-yellow-700
                  bg-yellow-400
                  text-xl
                  border-2 border-yellow-700
                  p-4
                  font-body
                  text-center
                  hover:bg-yellow-300
                  flex
                "
                @click="buy = !buy"
              >
                <ArrowUp class="mx-2" />
                {{ buy ? 'Swap to' : 'Swap from' }}
                <ArrowDown class="mx-2" />
              </button>
            </div>
            <div>
              <h4 class="text-gray-600">Total Lords For Trade</h4>
              <div class="bg-gray-1000 p-4 rounded-2xl">
                <div class="text-2xl flex justify-between">
                  <span>👑 LORDS:</span>
                  <span>~{{ lordsPrice }}</span>
                </div>
                <div>Balance: {{ lordsBalance }}</div>
              </div>
            </div>
          </div>
          <div class="w-1/3"></div>
          <div class="w-full mt-8">
            <BButton
              class="w-full"
              type="primary"
              @click.native="onSwapSubmit"
              >{{ buy ? 'Buy' : 'Sell' }}</BButton
            >
          </div>
        </div>
      </MarketCard>
      <div v-if="selectedMenu.data === 'lp'">
        <div class="p-4 text-2xl font-display">
          Become a Merchant and provide Liquidty on Trade Routes. Earn Fees
        </div>
        <MarketCard>
          <div class="flex flex-wrap">
            <div class="flex justify-between w-full">
              <div
                v-if="!selectedResources.length"
                class="w-full text-2xl mb-4"
              >
                Select Resources
              </div>
              <div class="ml-auto"><Deadline /></div>
            </div>

            <div
              :class="{ 'flex-col-reverse': add }"
              class="w-full flex flex-col transition duration-300"
            >
              <div
                v-for="resource in selectedResources"
                :key="resource.id"
                class="flex space-x-4"
              >
                <ResourceSelect
                  class="transition duration-300 w-1/2"
                  :resource="resource"
                  @x-click="onArrowClick(resource)"
                  @amount-changed="
                    onAmountChanged(resource, $event.target.value)
                  "
                />
                <AdventurersLiquidity
                  class="w-1/2"
                  :resource="resource"
                  @arrow-click="onArrowClick(resource)"
                />
              </div>

              <div class="flex my-4">
                <button
                  class="
                    rounded-full
                    mx-auto
                    text-yellow-700
                    bg-yellow-400
                    text-xl
                    border-2 border-yellow-700
                    p-4
                    font-body
                    text-center
                    hover:bg-yellow-300
                    flex
                  "
                  @click="add = !add"
                >
                  <ArrowUp class="mx-2" />
                  {{ add ? 'Add Liquidity' : 'Remove Liquidity' }}
                  <ArrowDown class="mx-2" />
                </button>
              </div>
              <div>
                <h4 class="text-gray-600">Total Lords For Liquidity</h4>
                <div class="bg-gray-1000 p-4 rounded-2xl">
                  <div class="text-2xl flex justify-between">
                    <span>👑 LORDS:</span>
                    <span>~{{ lordsPrice }}</span>
                  </div>
                  <div>Balance: {{ lordsBalance }}</div>
                </div>
              </div>
            </div>
            <div class="w-1/3"></div>
            <div class="w-full mt-8">
              <BButton class="w-full" type="primary">{{
                add ? 'Add Liquidity' : 'Remove Liquidity'
              }}</BButton>
            </div>
          </div>
        </MarketCard>
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
      </div>
    </div>
  </div>
</template>
<script>
import { useFetch, defineComponent, ref } from '@nuxtjs/composition-api'
// import { resources } from '@/composables/utils/resourceColours'
import { useLords } from '~/composables/lords/useLords'
import { useMarket } from '~/composables/market/useMarket'
import { usePrice } from '~/composables'
import { useResources } from '~/composables/resources/useResources'
import ArrowUp from '~/assets/img/arrow-up.svg?inline'
import ArrowDown from '~/assets/img/arrow-down.svg?inline'

export default defineComponent({
  components: {
    ArrowUp,
    ArrowDown,
  },
  fetchOnServer: false,
  setup(props, context) {
    const { allUsersResources } = useResources()
    const { goldPrice } = usePrice()
    const { address } = context.root.$route.params
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
      selectedResources,
      lordsPrice,
    } = useMarket()

    const menu = [
      {
        data: 'Swap',
        name: 'Swap',
      },
      {
        data: 'lp',
        name: 'Merchant LPs',
      },
    ]
    const selectedMenu = ref(menu[0])
    const setActiveMenu = (data) => {
      selectedMenu.value = data
    }

    const buy = ref(false)
    const add = ref(false)
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

    function setOrderType(orderType) {
      selectedOrderType.value = orderType
    }

    const filteredResources = allUsersResources.value.filter((d) => {
      return d.value > 1
    })

    const sortedResources = filteredResources.sort((a, b) => {
      return b.value - a.value
    })

    useFetch(async () => {
      await getAdventurersLords(address)
    })

    // function onXClick(resource) {
    //   const i = selectedResources.value.indexOf(resource)
    //   selectedResources.value.splice(i, 1)
    //   updateLordsPrice()
    // }

    const onLiquiditySubmit = async () => {
      const withAmounts = selectedResources.value.filter((e) => e.amount > 0)
      const resourceIds = withAmounts.map((e) => e.id)
      const resourceAmounts = withAmounts.map((e) => e.amount)
      if (add.value) {
        await addLiquidity(resourceIds, resourceAmounts, resourceAmounts)
      } else {
        await removeLiquidity(resourceIds, resourceAmounts, resourceAmounts)
      }
    }

    const onSwapSubmit = async () => {
      const withAmounts = selectedResources.value.filter((e) => e.amount > 0)
      const resourceIds = withAmounts.map((e) => e.id)
      const resourceAmounts = withAmounts.map((e) => e.amount)
      if (buy.value) {
        console.log('buy')
        await buyTokens(resourceIds, resourceAmounts)
      } else {
        console.log('sell')
        await sellTokens(resourceIds, resourceAmounts)
      }
    }

    return {
      onLiquiditySubmit,
      onSwapSubmit,
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
      // onXClick,
      setActiveMenu,
      selectedMenu,
      menu,
      buy,
      add,
    }
  },
})
</script>
