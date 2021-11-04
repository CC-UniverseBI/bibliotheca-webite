<template>
  <div class="hidden sm:flex justify-end px-4 py-4">
    <div v-if="active" class="px-4 self-center mr-auto">
      <BButton
        :to="'/adventurer/' + account + '/empire'"
        type="primary"
        class="flex"
      >
        <span class="self-center">See My Empire</span>
      </BButton>
    </div>
    <NetworkSwitcher />
    <div v-if="active" v-click-outside="hide" class="flex">
      <BButton
        v-if="!show"
        type="primary"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
        @click="show = !show"
      >
        <span>
          {{ shortenHash(account) }}
        </span>
      </BButton>
      <BButton
        v-else
        type="primary"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
        @click="deactivate"
      >
        <span> disconnect? </span>
      </BButton>
    </div>
    <BButton v-else class="" type="primary" @click="open">
      Connect to the Lootverse
    </BButton>
  </div>
</template>

<script>
import { defineComponent, ref } from '@nuxtjs/composition-api'
import { useWeb3 } from '@instadapp/vue-web3'
import { useFormatting } from '~/composables/useFormatting'
// import Helm from '~/assets/img/helm.svg?inline'
import { useWeb3Modal } from '~/composables/web3/useWeb3Modal'
export default defineComponent({
  // components: {
  //   Helm,
  // },
  setup() {
    // const { activeAccount } = useDSA();
    const { account, active, deactivate } = useWeb3()
    const { shortenHash } = useFormatting()
    const { open } = useWeb3Modal()
    const show = ref(false)

    const hide = () => {
      show.value = false
    }

    return {
      hide,
      show,
      account,
      open,
      // activeAccount,
      active,
      deactivate,
      shortenHash,
    }
  },
})
</script>
