<template>
  <div class="container flex">
    <MarketTable
      v-if="sortedResources"
      class="w-1/2"
      :resources="sortedResources"
    />
    <div class="w-1/2 flex flex-col">
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
            class="w-3/3 flex flex-col transition-all duration-300"
          >
            <h4 v-if="!buy" class="text-gray-600">Swap From:</h4>
            <div
              v-for="resource in selectedResources"
              :key="resource.id"
              class="flex space-x-4"
            >
              <ResourceSelect
                class="transition-all duration-300 w-1/2 ease-in-out"
                :resource="resource"
                @x-click="onArrowClick(resource)"
                @amount-changed="onAmountChanged(resource, $event.target.value)"
              />
              <AdventurersLiquidity
                class="w-1/2"
                :resource="resource"
                @arrow-click="onArrowClick(resource)"
              />
            </div>
            <h4 v-if="buy" class="text-gray-600">Swap To:</h4>
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
                <ArrowUp class="mx-1" />

                <ArrowDown class="mx-1" />
              </button>
            </div>
            <div>
              <h4 class="text-gray-600">Swap {{ buy ? 'From:' : 'To:' }}</h4>
              <div class="bg-gray-1000 p-4 rounded-2xl">
                <div class="text-2xl flex justify-between">
                  <span class="self-start">👑 LORDS:</span>
                  <span class="self-end">~{{ lordsPrice }}</span>
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
              :loading="loading.market"
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
                  {{ add ? 'Remove Liquidity' : 'Add Liquidity' }}
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
              <BButton
                :loading="loading.market"
                class="w-full"
                type="primary"
                @click.native="onLiquiditySubmit"
                >{{ add ? 'Add Liquidity' : 'Remove Liquidity' }}</BButton
              >
            </div>
          </div>
        </MarketCard>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref, onMounted } from '@nuxtjs/composition-api'
// import { resources } from '@/composables/utils/resourceColours'
import { ethers } from 'ethers'
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
      loading,
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

    onMounted(async () => {
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
      const resourceAmounts = withAmounts.map((e) =>
        ethers.utils.parseUnits(e.amount, 'ether')
      )
      if (add.value) {
        await addLiquidity(resourceIds, resourceAmounts)
      } else {
        await removeLiquidity(resourceIds, resourceAmounts)
      }
    }

    const onSwapSubmit = async () => {
      const withAmounts = selectedResources.value.filter((e) => e.amount > 0)
      const resourceIds = withAmounts.map((e) => e.id)
      const resourceAmounts = withAmounts.map((e) => e.amount)
      if (buy.value) {
        await buyTokens(resourceIds, resourceAmounts)
      } else {
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
      loading,
    }
  },
})
</script>
