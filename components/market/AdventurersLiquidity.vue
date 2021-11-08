<template>
  <div class="text-2xl self-center">
    <!-- <div class="p-2">
      <span v-if="loading.resources"><LoadingDots class="w-8 h-2" /></span
      ><span v-else
        >{{ 1 }}👑 = {{ (resourceReserve / lordsReserve).toFixed(1) }}</span
      >
    </div> -->
    <!-- <div class="p-2">
      {{ lordsReserve }}👑 <br />
      {{ resourceReserve }}
    </div> -->
    <span v-if="!hasLiquidity" class="text-red-600 text-sm">NO LIQUIDITY</span>
    <div class="text-base font-semibold">
      <!-- {{ lordsReserve }} <br /> -->
      {{ lordsReserveSupply }} /
      {{ liquidityTokenSupply }}
    </div>
    <div class="text-base">
      Share: {{ ((100 * lbalance) / liquidityTokenSupply).toFixed(1) }} %
    </div>
    <!-- <div>
      <button type="button" @click="$emit('arrow-click')">
        <ArrowRight />
      </button>
    </div> -->
  </div>
</template>
<script>
import {
  useFetch,
  defineComponent,
  ref,
  computed,
} from '@nuxtjs/composition-api'
// import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'
import { useMarket } from '~/composables/market/useMarket'
// import ArrowRight from '~/assets/img/arrow-right.svg?inline'
export default defineComponent({
  // components: {
  //   ArrowRight,
  // },
  props: {
    resource: {
      type: Object,
      required: true,
    },
  },
  setup(props, context) {
    // const { slug } = context.root.$route.params
    // const { fetchResource, loading } = useResources()
    const {
      fetchResourceReserve,
      fetchCurrencyReserve,
      fetchLiquidityBalance,
      fetchLiquidityTokenSupply,
      loading,
    } = useMarket()

    const lordsReserve = ref()
    const resourceReserve = ref()
    const lbalance = ref()
    const lsupply = ref()

    useFetch(async () => {
      lordsReserve.value = await fetchCurrencyReserve(props.resource.id)
      resourceReserve.value = parseInt(
        ethers.utils.formatEther(await fetchResourceReserve(props.resource.id))
      ).toFixed(2)
      lbalance.value = parseInt(
        ethers.utils.formatEther(await fetchLiquidityBalance(props.resource.id))
      ).toFixed(2)
      lsupply.value = await fetchLiquidityTokenSupply([props.resource.id])
    })

    const liquidityTokenSupply = computed(() => {
      return lsupply.value
        ? parseInt(ethers.utils.formatEther(lsupply.value[0])).toFixed(2)
        : null
    })

    const lordsReserveSupply = computed(() => {
      return lordsReserve.value
        ? parseInt(ethers.utils.formatEther(lordsReserve.value[0])).toFixed(2)
        : null
    })

    const hasLiquidity = computed(() => {
      return (
        parseInt(lordsReserveSupply.value) !== 0.0 &&
        parseInt(liquidityTokenSupply.value) !== 0.0
      )
    })

    return {
      hasLiquidity,
      liquidityTokenSupply,
      lordsReserveSupply,
      lordsReserve,
      resourceReserve,
      lbalance,
      lsupply,
      loading,
    }
  },
})
</script>
