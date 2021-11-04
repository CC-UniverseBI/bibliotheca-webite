<template>
  <div class="text-2xl">
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
    <div class="text-base">
      <!-- {{ lordsReserve }} <br /> -->
      {{ lbalance }} /
      {{ lsupply }}
    </div>
    <div class="text-base">
      Share: {{ ((100 * lbalance) / lsupply).toFixed(1) }} %
    </div>
    <!-- <div>
      <button type="button" @click="$emit('arrow-click')">
        <ArrowRight />
      </button>
    </div> -->
  </div>
</template>
<script>
import { useFetch, defineComponent, ref } from '@nuxtjs/composition-api'
// import { BigNumber } from '@ethersproject/bignumber'
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
      resourceReserve.value = await fetchResourceReserve(props.resource.id)
      lbalance.value = await fetchLiquidityBalance(props.resource.id)
      lsupply.value = await fetchLiquidityTokenSupply(props.resource.id)
    })

    return {
      lordsReserve,
      resourceReserve,
      lbalance,
      lsupply,
      loading,
    }
  },
})
</script>
