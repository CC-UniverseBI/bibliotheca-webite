<template>
  <div>
    <div class="text-center">
      <h1>Arbitrum Transfer Bridge</h1>
      <h5 class="text-xl">
        You are currently connected to
        <span class="text-red-400">{{ activeNetwork.displayName }}</span>
      </h5>
    </div>
    <div class="flex mt-8 flex-wrap">
      <div class="sm:w-4/12 flex justify-around top-50">
        <div class="">
          <h4 class="mb-4 flex">
            Ethereum Layer 1
            <Lock v-if="activeNetwork.isArbitrum" class="ml-4" />
          </h4>
          <div
            :class="{
              'opacity-75 bg-gray-800': activeNetwork.isArbitrum,
              'bg-gradient-to-b from-gray-800': !activeNetwork.isArbitrum,
            }"
            class="rounded-2xl w-80 shadow-2xl relative"
          >
            <div
              v-if="activeNetwork.isArbitrum"
              class="absolute bg-black z-20 h-full w-full rounded-xl opacity-25"
            ></div>
            <div class="p-6">
              <h3 class="mb-4">Your Realms</h3>
              <div v-if="loadingRealms"><LoadingRings /></div>
              <AssetPill
                v-for="(asset, index) in userRealms.l1"
                v-else
                :key="index"
                :asset="asset"
                :selected="
                  getSelectedRealm
                    ? getSelectedRealm.token_id === asset.id
                    : false
                "
                :disabled="activeNetwork.isArbitrum"
                @bridged="popFromArray"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="sm:w-4/12 justify-around my-4 sticky top-50 h-full">
        <div class="w-full p-4 rounded-xl my-4">
          <h3>
            <span v-if="getSelectedRealm">Selected</span
            ><span v-else>Select</span> Realm
            <span v-if="getSelectedRealm"
              >#{{ getSelectedRealm.token_id }}</span
            >
          </h3>
          <div v-if="getSelectedRealm">
            <RealmCard
              v-if="!loadingMeta"
              :id="getSelectedRealm.token_id"
              :realm="getSelectedRealm"
            />
            <Loader v-else />
          </div>
        </div>
      </div>
      <div class="sm:w-4/12 flex justify-around top-50 h-full">
        <div>
          <h4 class="mb-4 flex">
            Arbitrum Layer 2
            <Lock v-if="!activeNetwork.isArbitrum" class="ml-4" />
          </h4>
          <div
            :class="{
              'opacity-75 bg-gray-800': !activeNetwork.isArbitrum,
              ' bg-gradient-to-b from-gray-800': activeNetwork.isArbitrum,
            }"
            class="rounded-xl w-80 shadow-2xl relative"
          >
            <div
              v-if="!activeNetwork.isArbitrum"
              class="absolute bg-black z-20 h-full w-full rounded-xl opacity-25"
            ></div>
            <div class="p-6">
              <h3 class="mb-4 text-white">Your Realms</h3>
              <AssetPill
                v-for="(asset, index) in userRealms.l2"
                :key="index"
                inverse
                :disabled="!activeNetwork.isArbitrum"
                :selected="
                  getSelectedRealm
                    ? getSelectedRealm.token_id === asset.id
                    : false
                "
                :loading="loadingBridge"
                :asset="asset"
                @click.native="selectRealmForTransfer(asset)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container mx-auto">
      <BridgeTransactionsTable
        :merged-transactions-to-show="mergedTransactionsToShow"
        :loading="loadingTransactions"
        :current-l1-block-number="currentL1BlockNumber"
        @triggerOutbox="triggerOutboxTransaction"
      />
    </div>
  </div>
</template>
<script>
import {
  defineComponent,
  onMounted,
  ref,
  watch,
  onBeforeUnmount,
} from '@nuxtjs/composition-api'
import { useWeb3 } from '@instadapp/vue-web3'
import Lock from '~/assets/img/lock.svg?inline'
import { activeNetwork } from '~/composables/web3/useNetwork'
import { useTransactions } from '~/composables/bridge/useTransactions'
import { useModal } from '~/composables/useModal'
import { useRealms } from '~/composables/web3/useRealms'
import { useBridge } from '~/composables/bridge/useBridge'
import LoadingRings from '~/assets/img/loadingRings.svg?inline'
import { useWeb3Modal } from '~/composables/web3/useWeb3Modal'
export default defineComponent({
  components: {
    Lock,
    LoadingRings,
  },

  setup() {
    const { showAssetBox } = useModal()
    const { getWalletRealms, userRealms, loading: loadingRealms } = useRealms()
    const { account, provider, library, active } = useWeb3()
    const { open } = useWeb3Modal()
    const {
      setInitialPendingWithdrawals,
      transactions,
      sortedTransactions,
      mergedTransactionsToShow,
      withdrawalsTransformed,
      pendingWithdrawalsMap,
      loading: loadingTransactions,
    } = useTransactions()
    const {
      initBridge,
      bridge,
      loadingBridge,
      loading,
      loadingMeta,
      triggerOutbox,
      checkAndAddL2DepositTxns,
      checkAndUpdatePendingTransactions,
      currentL1BlockNumber,
      getSelectedRealm,
    } = useBridge()

    const triggerOutboxTransaction = async (transaction) => {
      console.log(transaction.txId.toString())
      const res = await triggerOutbox(
        pendingWithdrawalsMap,
        transaction.txId.toString()
      )

      if (!res) {
        // eslint-disable-next-line no-alert
        alert("Can't claim this withdrawal yet; try again later")
      }
    }
    const addL2Interval = ref()
    const checkPendingInterval = ref(null)

    onMounted(() => {
      if (!account.value) return open()
    })
    onBeforeUnmount(() => {
      clearInterval(addL2Interval.value)
      clearInterval(checkPendingInterval.value)
    })
    watch(
      [active, account, activeNetwork],
      async (val) => {
        if (val) {
          clearInterval(addL2Interval.value)
          clearInterval(checkPendingInterval.value)
          if (account.value) {
            await Promise.all([await initBridge(), await getWalletRealms()])
            await setInitialPendingWithdrawals(bridge, {
              fromBlock: 4832019,
            })
          }
          addL2Interval.value = setInterval(
            () => checkAndAddL2DepositTxns,
            4000
          )
          checkPendingInterval.value = setInterval(
            () => checkAndUpdatePendingTransactions,
            4000
          )
        }
      },
      {
        immediate: true,
      }
    )
    const popFromArray = (value) => {
      const index = userRealms.value.l1.map((e) => e.id).indexOf(value)
      userRealms.value.l1.splice(index, 1)
    }
    return {
      activeNetwork,
      active,
      provider,
      library,
      account,
      bridge,
      userRealms,
      triggerOutboxTransaction,
      mergedTransactionsToShow,
      loadingRealms,
      showAssetBox,
      currentL1BlockNumber,
      loading,
      loadingBridge,
      loadingTransactions,
      transactions,
      sortedTransactions,
      withdrawalsTransformed,
      getSelectedRealm,
      loadingMeta,
      popFromArray,
    }
  },
})
</script>
