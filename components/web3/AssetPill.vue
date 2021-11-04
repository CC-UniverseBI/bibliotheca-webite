<template>
  <div class="flex space-x-4">
    <button
      :disabled="disabled"
      :class="{
        'bg-gray-300 -translate-y-1 shadow-xl text-black': selected,
        'bg-gray-600': !selected,
      }"
      class="
        rounded
        px-4
        py-3
        my-4
        flex
        justify-between
        w-full
        hover:text-black hover:shadow-xl hover:-translate-y-1 hover:bg-gray-200
        transform
        transition
        duration-300
        ease-in-out
        group
        shadow-inner
      "
      @click="selectRealmForTransfer(asset)"
    >
      <span :class="{ 'order-2': inverse }" class="self-center text-lg"
        >#{{ asset.id }}
      </span>
      <slot />

      <ArrowRight
        :class="{ 'rotate-180': inverse, 'opacity-100': selected }"
        class="
          w-4
          h-4
          self-center
          mx-2
          transform
          group-hover:opacity-100 group-hover:-translate-y-1
          opacity-0
          duration-150
          text-black
          transition
        "
      />
    </button>
    <button
      v-if="selected || loading.depositL1"
      class="
        rounded
        px-4
        py-3
        my-4
        flex
        justify-between
        w-full
        hover:text-black hover:shadow-xl
        bg-green-500
        hover:-translate-y-1 hover:bg-green-200
        text-green-900
        transform
        transition
        duration-300
        ease-in-out
        group
        shadow-inner
        text-center
      "
      @click="l2Function"
    >
      <LoadingRings v-if="loading.depositL1" class="mx-auto" />
      <span v-else class="mx-auto">Confirm?</span>
    </button>
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'
import LoadingRings from '~/assets/img/loadingRings.svg?inline'
import ArrowRight from '~/assets/img/arrow-right.svg?inline'
import { useBridge } from '~/composables/bridge/useBridge'
import { activeNetwork } from '~/composables/web3/useNetwork'
import { useRealms } from '~/composables/web3/useRealms'
export default defineComponent({
  components: {
    LoadingRings,
    ArrowRight,
  },
  props: {
    asset: {
      type: Object,
      required: true,
    },

    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    inverse: {
      type: Boolean,
      required: false,
      default: false,
    },
    selected: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, context) {
    const {
      initBridge,
      depositRealm,
      withdrawToL1,
      bridge,
      loading,
      selectRealmForTransfer,
      getSelectedRealm,
    } = useBridge()
    const { getWalletRealms } = useRealms()

    const l2Function = async () => {
      if (!bridge.value) {
        await initBridge()
      }
      if (!activeNetwork.value.isArbitrum) {
        await depositRealm(props.asset.id)
        setTimeout(async function () {
          await getWalletRealms()
        }, 2500)
        context.emit('bridged', props.asset.id)
      } else {
        await withdrawToL1(props.asset.id)
      }
    }
    return {
      selectRealmForTransfer,
      getSelectedRealm,
      l2Function,
      loading,
    }
  },
})
</script>
