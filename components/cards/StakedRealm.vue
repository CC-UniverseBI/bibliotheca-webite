<template>
  <div
    :class="{ 'bg-gray-900': active }"
    class="
      bg-black
      rounded-3xl
      mr-8
      my-4
      text-white
      transform
      transition
      duration-150
      min-h-80
      hover:shadow-2xl hover:border-green-300
      border-2 border-gray-900
      flex flex-col
      group
      p-4
      w-80
    "
  >
    <div
      class="group flex flex-col h-full"
      :class="{ 'bg-white hidden': active }"
    >
      <div class="relative">
        <div
          class="
            absolute
            right-10
            opacity-0
            top-10
            group-hover:opacity-100
            transition-all
            duration-250
          "
        >
          <button
            class="
              bg-gray-300
              rounded
              p-2
              ml-auto
              text-gray-500
              hover:bg-gray-600
              shadow
              font-body
            "
            @click="active = true"
          >
            Flip
          </button>
        </div>
        <!-- <img
          v-if="metaData"
          class="rounded-xl"
          :src="metaData.image_url"
          alt=""
        /> -->

        <!-- <Loader v-else class="w-full" /> -->
      </div>

      <div class="p-2 flex flex-col h-full">
        <h1 v-if="realm" class="flex justify-between">
          <span>{{ realm.name }}</span>
          <span class="text-gray-500 text-xl">#{{ realm.id }}</span>
        </h1>
        <Ens v-if="realm && !isMyRealm" :address="realm.currentOwner.address" />
        <div v-else-if="realm">👑 Your Realm</div>

        <div class="flex justify-between">
          <div class="py-4">
            <OrderChip class="text-sm font-semibold" :order-id="realm.order" />
          </div>
          <Happiness class="self-center" :realm="realm.id" />
          <RealmStatistics
            v-if="offence !== null"
            :offence="offence"
            class="self-center"
            :realm="realm.id"
          />
        </div>
        <RealmAgeStats
          :age-claimed="realm.ageClaimed"
          :age-settled="realm.ageSettled"
        />
        <div
          v-if="raidingArmy"
          class="my-2 border-t border-b py-3 border-gray-900"
        >
          <span class="uppercase text-red-600 font-display">Military</span>
          <span class="text-sm uppercase">Units | Offence | defence</span>
          <RealmMilitary
            :realm-id="realm.id"
            :unit="raidingArmy[0]"
            :unit-id="0"
            :time="raidingArmy[1]"
            :max-army="maxArmy"
          >
          </RealmMilitary>
          <RealmMilitary
            :realm-id="realm.id"
            :unit="raidingArmy[2]"
            :unit-id="1"
            :time="raidingArmy[3]"
            :max-army="maxArmy"
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
        <div class="my-2 border-b pb-3 border-gray-900">
          <span class="uppercase text-red-600 font-display"
            >days unclaimed</span
          >
          <div class="flex justify-between">
            <div>
              <span
                >Day:
                <span v-if="balance" class="font-semibold text-gray-300"
                  >{{ (balance.day / 3600).toFixed(4) }}
                </span>
              </span>
              <br />
              <span
                >Vault:
                <span v-if="balance" class="font-semibold text-gray-300"
                  >{{ (balance.month / 3600).toFixed(4) }}
                </span>
              </span>
            </div>
            <div v-if="isAddressPage">
              <BButton type="small" @click="claimResources(realm.id)">
                <LoadingRings v-if="loading.stake" class="mx-auto w-7 h-7" />
                <span v-else>Claim</span>
              </BButton>
            </div>
          </div>
        </div>

        <div class="my-3">
          <span class="uppercase text-red-600 font-display">Resources</span>
          <div class="text-xs">
            <span class="uppercase">LVL Resource p/day</span>
          </div>
          <StakedRealmResource
            v-for="(resource, index) in realm.resources"
            :key="index"
            :resource="resource"
            :realm-id="realm.id"
          />
        </div>
        <RaidRealm
          v-if="!isAddressPage && !isMyRealm"
          :raided-realm="realm"
          class="w-full mt-auto"
        />
      </div>
    </div>
    <div
      class="h-full w-full flex flex-col"
      :class="{ 'bg-white hidden': !active }"
    >
      <div class="flex p-3">
        <button
          class="
            bg-gray-300
            rounded
            p-2
            ml-auto
            text-gray-500
            hover:bg-gray-600
            shadow
            font-body
          "
          @click="active = false"
        >
          Flip
        </button>
      </div>

      <div v-if="buildings && realm.traits" class="my-3 px-2">
        <span class="uppercase text-red-400 font-display">Buildings</span>
        <RealmBuildings
          v-for="(building, index) in buildings"
          :key="index"
          :building-id="index"
          :building="building"
          :realm-id="realm.id"
          :realm-traits="realm.traits"
        />
      </div>
      <div v-if="realm.traits" class="px-2">
        <Levels
          flex
          :cities="realm.traits[1]"
          :harbours="realm.traits[2]"
          :regions="realm.traits[0]"
          :rivers="realm.traits[3]"
        />
      </div>
      <BButton
        v-if="isAddressPage"
        class="w-full mt-auto"
        type="primary"
        @click="unsettle(realm.id)"
      >
        <LoadingRings v-if="loading.stake" class="mx-auto w-7 h-7" />
        <span v-else>Unsettle Realm</span>
      </BButton>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref, computed } from '@vue/composition-api'

import { useFetch } from '@nuxtjs/composition-api'
import { useStaking } from '~/composables/staking/useStaking'
import { useConnect } from '~/composables/web3/useConnect'

import { useConstruction } from '~/composables/construction/useConstruction'
import LoadingRings from '~/assets/img/loadingRings.svg?inline'
import { useMilitary } from '~/composables/military/useMilitary'
import { useWeb3 } from '~/composables/web3'

// import { militaryUnits } from '@/composables/utils/militaryUnits'
export default defineComponent({
  components: {
    LoadingRings,
  },
  fetchOnServer: false,
  props: {
    realm: {
      type: Object,
      required: true,
    },
  },
  setup(props, context) {
    const { isAddressPage } = useConnect()
    const {
      getRealmsResourceBalance,
      claimResources,
      balance,
      loading,
      result,
      withdraw,
    } = useStaking()
    const { account } = useWeb3()
    const {
      constructBuilding,
      getBuildings,
      buildings,
      loading: loadingConstruction,
      error: errorConstruction,
      result: resultConstruction,
    } = useConstruction()

    const {
      //   buildRaiding,
      fetchRaiding,
      //   fetchUnitCost,
      raidingArmy,
      offence,
    } = useMilitary()

    const metaData = ref()

    const isMyRealm = computed(() => {
      if (account.value) {
        return account.value.toLowerCase() === props.realm.currentOwner.id
      } else {
        return false
      }
    })

    const unsettle = async (id) => {
      try {
        await withdraw(id)
        context.emit('unsettle', id)
      } catch (e) {
        console.log(e)
      }
    }

    useFetch(async () => {
      await getRealmsResourceBalance(props.realm.id)
      // const response = await fetchRealmMetaData(props.realm.id)
      // metaData.value = response.data
      await getBuildings(props.realm.id)
      await fetchRaiding(props.realm.id)
    })

    // const fetchRealmMetaData = async (id) => {
    //   try {
    //     return await axios.get(
    //       'https://api.opensea.io/api/v1/asset/0x7afe30cb3e53dba6801aa0ea647a0ecea7cbe18d/' +
    //         id
    //     )
    //   } catch (e) {
    //     console.log(e)
    //   }
    // }

    const active = ref(false)

    const maxArmy = computed(() => {
      // const knights = parseInt(raidingArmy.value[0])
      // const footsoliders = parseInt(raidingArmy.value[2])

      // const castles = parseInt(buildings.value[2]) * 5 + parseInt(buildings.value[4]) * 2;

      return parseInt(buildings.value[2]) * 5 + parseInt(buildings.value[4]) * 2
    })

    return {
      maxArmy,
      claimResources,
      isMyRealm,
      getRealmsResourceBalance,
      balance,
      loading,
      result,
      metaData,
      withdraw,
      loadingConstruction,
      errorConstruction,
      resultConstruction,
      constructBuilding,
      getBuildings,
      buildings,
      active,
      unsettle,
      isAddressPage,
      raidingArmy,
      offence,
    }
  },
})
</script>
