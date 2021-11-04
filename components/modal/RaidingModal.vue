<template>
  <div
    class="
      container
      bg-gray-900
      flex
      p-8
      rounded-2xl
      shadow-3xl
      border-4
      h-screen
      overflow-y-scroll
    "
  >
    <div class="w-4/12">
      <RaidingRealm
        v-if="selectedAttackingRealm"
        :realm="selectedAttackingRealm"
        attacking
      />
      <h5 class="w-full text-2xl text-gray-300 pb-4">Select Realm</h5>
      <div class="flex justify-between flex-wrap">
        <div v-if="sRealms" class="overflow-y-scroll max-h-1/2">
          <RaidingRealm
            v-for="(realm, index) in sRealms"
            :key="index"
            :realm="realm"
            attacking
          />
        </div>
      </div>
    </div>
    <div class="w-4/12 flex flex-col self-center">
      <div class="text-2xl text-center mb-8">
        Sir, your chance of a successful raid: <br />
        <span v-if="chance" class="font-semibold text-3xl">{{ chance }}%</span>
        <span v-else class="font-semibold text-3xl"
          >0% <br />
          (You have no raiding units)</span
        >
      </div>
      <RaidResults
        v-if="raidResults"
        :raid-results="raidResults"
        :defending-realm="raidedRealm"
        :attacking-realm="selectedAttackingRealm"
      />
      <div class="w-full flex">
        <WarriorDeath
          v-if="raidResults && !raidResults.resourcesIdsPillaged.length"
          class="self-center mx-auto"
        />
        <WarriorFighting
          v-else-if="loading.raidingRealm"
          class="self-center mx-auto"
        />
        <WarriorStanding v-else-if="raiding" class="self-center mx-auto" />
        <WarriorRunning v-else class="self-center mx-auto" />
        <BButton
          class="self-center mx-auto text-xl flex"
          type="primary"
          :disabled="!selectedAttackingRealm"
          @click.native="
            raidingRealm(selectedAttackingRealm.id, raidedRealm.id)
          "
          @mouseenter.native="raiding = false"
          @mouseleave.native="raiding = true"
        >
          <span class="text-3xl">⚔️</span>
          <span class="self-center ml-3">{{
            loading.raidingRealm ? 'RAIDING!!!' : 'Raid'
          }}</span>
        </BButton>
        <WarriorDeath
          v-if="raidResults && raidResults.resourcesIdsPillaged.length"
          class="self-center mx-auto"
        />
        <WarriorFighting
          v-else-if="loading.raidingRealm"
          inverse
          class="self-center mx-auto"
        />
        <WarriorStanding
          v-else-if="raiding"
          inverse
          class="self-center mx-auto"
        />
        <WarriorRunning v-else inverse class="self-center mx-auto" />
      </div>
      <div
        class="
          text-center
          bg-black
          rounded-t-full
          shadow
          p-6
          pt-8
          border-yellow-300 border-4
        "
      >
        <div class="text-2xl font-display mb-3">
          {{ raidedRealm.name }} Vault: <br />
          <span v-if="balance" class="text-3xl">{{ balanceRounded }} Days</span>
        </div>

        <div class="flex justify-around">
          <div v-if="balance" class="flex flex-col text-left text-2xl">
            <RaidedResource
              v-for="(resource, index) in raidedRealm.resources"
              :key="index"
              :resource="resource"
              :realm-id="raidedRealm.id"
              :vault="balanceRounded"
            />
          </div>
        </div>
        <div class="pt-8">
          You will win 25% of the total resources on a successful raid.
        </div>
      </div>
    </div>
    <div class="w-4/12">
      <div class="flex justify-between flex-wrap">
        <h2 class="w-full text-center mb-8">You are Raiding</h2>
        <RaidingRealm class="ml-auto" :realm="raidedRealm" />
      </div>
    </div>
  </div>
</template>
<script>
import { useWeb3 } from '@instadapp/vue-web3'
import {
  useFetch,
  defineComponent,
  computed,
  ref,
  watch,
} from '@nuxtjs/composition-api'
import { useAdventurer } from '~/composables/useAdventurer'
import { useStaking } from '~/composables/staking/useStaking'
import { useRaiding } from '~/composables/military/useRaiding'
export default defineComponent({
  props: {
    raidedRealm: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const {
      raidingRealm,
      loading,
      raidResults,
      selectedAttackingRealm,
      selectAttackingRealm,
      removeAttackingRealm,
      raidChance,
      chance,
    } = useRaiding()
    const { getAdventurer, adventurer, l2 } = useAdventurer()
    const { account } = useWeb3()

    const { getRealmsResourceBalance, balance } = useStaking()
    useFetch(async () => {
      await getRealmsResourceBalance(props.raidedRealm.id)
      await getAdventurer(account.value, 'l2')
      await raidChance(selectedAttackingRealm.value.id, props.raidedRealm.id)
    })
    const sRealms = computed(() => {
      return selectedAttackingRealm.value
        ? adventurer.l2?.srealms.filter(
            (a) => a.id !== selectedAttackingRealm.value.id
          )
        : adventurer.l2?.srealms
    })

    const balanceRounded = computed(() => {
      return Math.floor((balance.value.month / 3600).toFixed(0))
    })

    const raiding = ref(true)

    watch(selectedAttackingRealm, async () => {
      await raidChance(selectedAttackingRealm.value.id, props.raidedRealm.id)
    })

    return {
      raiding,
      raidResults,
      adventurer,
      sRealms,
      balance,
      balanceRounded,
      raidingRealm,
      loading,
      selectedAttackingRealm,
      selectAttackingRealm,
      removeAttackingRealm,
      raidChance,
      l2,
      chance,
    }
  },
})
</script>
