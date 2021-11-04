<template>
  <div
    :class="{ 'border-green-300': selectedAttackingRealm.id === realm.id }"
    class="
      bg-black
      rounded-xl
      mr-8
      my-4
      text-white
      transform
      transition
      duration-150
      min-h-80
      hover:shadow-2xl hover:border-green-300
      border-2 border-gray-800
      flex flex-col
      group
      p-4
      w-80
    "
  >
    <div class="group flex flex-col h-full">
      <div class="p-2 flex flex-col">
        <h1 class="flex justify-between">
          <span>{{ realm.name }}</span>
          <span class="text-gray-500 text-xl">#{{ realm.id }}</span>
        </h1>
        <Ens v-if="realm" :address="realm.currentOwner.address" />

        <div class="flex justify-between">
          <div class="py-4">
            <OrderChip class="text-sm" :order-id="realm.order" />
          </div>
          <!-- <Happiness class="self-center" :realm="realm.id" /> -->
        </div>
        <RealmStatistics
          v-if="offence !== null"
          :offence="offence"
          :icon="false"
          :realm="realm.id"
        />
        <div v-if="raidingArmy" class="my-3">
          <span class="uppercase text-red-400 font-display">Military</span>
          <span class="text-sm uppercase">Units | Offence | defence</span>
          <RealmMilitary
            :realm-id="realm.id"
            :unit="raidingArmy[0]"
            :unit-id="0"
            :time="raidingArmy[1]"
          >
          </RealmMilitary>
          <RealmMilitary
            :realm-id="realm.id"
            :unit="raidingArmy[2]"
            :unit-id="1"
            :time="raidingArmy[3]"
          >
          </RealmMilitary>
          <RealmMilitary
            :realm-id="realm.id"
            :unit="raidingArmy[4]"
            :unit-id="2"
            :time="raidingArmy[5]"
          >
          </RealmMilitary>
          <RealmMilitary
            :realm-id="realm.id"
            :unit="raidingArmy[6]"
            :unit-id="3"
            :time="raidingArmy[7]"
          >
          </RealmMilitary>
        </div>

        <BButton
          v-if="attacking && selectedAttackingRealm.id !== realm.id"
          type="primary"
          @click="selectAttackingRealm(realm)"
          >Select Realm</BButton
        >
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, onMounted, watch } from '@vue/composition-api'

import { useStaking } from '~/composables/staking/useStaking'
import { useConnect } from '~/composables/web3/useConnect'

import { useRaiding } from '~/composables/military/useRaiding'
import { useMilitary } from '~/composables/military/useMilitary'
export default defineComponent({
  props: {
    realm: {
      type: Object,
      required: true,
    },
    attacking: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, context) {
    const { selectAttackingRealm, selectedAttackingRealm } = useRaiding()
    const { isAddressPage } = useConnect()
    const {
      claimResources,

      loading,
      error,
      result,
      withdraw,
    } = useStaking()

    const { fetchRaiding, raidingArmy, offence } = useMilitary()

    onMounted(async () => {
      await fetchRaiding(props.realm.id)
    })

    watch(selectedAttackingRealm, async () => {
      await fetchRaiding(props.realm.id)
    })

    return {
      claimResources,

      loading,
      error,
      result,
      withdraw,
      isAddressPage,
      raidingArmy,
      selectAttackingRealm,
      selectedAttackingRealm,
      offence,
    }
  },
})
</script>
