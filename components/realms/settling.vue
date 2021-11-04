<template>
  <div class="container">
    <div>
      <h2>Select Realm to Settle</h2>
    </div>
    <div v-if="!realmsLoading" class="flex flex-wrap">
      <RealmCard
        v-for="realm in metaData"
        :id="realm.token_id"
        :key="realm.id"
        :realm="realm"
        stake
        class="w-80"
        @realmSettled="popFromArray"
      />
    </div>
    <div v-else>
      <Loader />
    </div>
  </div>
</template>
<script>
import { defineComponent, onMounted, ref } from '@vue/composition-api'
import axios from 'axios'
import { useRealms } from '~/composables/web3/useRealms'
import { useStaking } from '~/composables/staking/useStaking'
import { useNetwork } from '~/composables/web3/useNetwork'
export default defineComponent({
  setup(props, context) {
    const { address } = context.root.$route.params
    const { getWalletRealms, userRealms, loading: realmsLoading } = useRealms()
    const {
      checkForNetworkMismatch,
      networkMismatch,
      activeNetworkId,
      useL2Network,
    } = useNetwork()
    const {
      stakeRealm,
      claimResources,
      claimBalance,
      realmBalance,
      loading,
      error,
      result,
    } = useStaking()

    const metaData = ref()

    onMounted(async () => {
      activeNetworkId.value = useL2Network.value.id

      if (networkMismatch.value) {
        checkForNetworkMismatch()
      }

      try {
        await getWalletRealms(address, 'l2')
      } catch (e) {
        console.log(e)
      } finally {
        if (userRealms.value.l2?.length) {
          const response = await getOSData(userRealms.value.l2)
          metaData.value = response.data.assets
        }
      }
    })

    const baseAssetAddress =
      'https://api.opensea.io/api/v1/assets?asset_contract_address=0x7afe30cb3e53dba6801aa0ea647a0ecea7cbe18d&'

    const getOSData = async (ids) => {
      const mapped = ids
        .map((bag) => {
          return 'token_ids=' + bag.id + '&'
        })
        .join('')
        .slice(0, -1)

      console.log(mapped)

      return await axios.get(baseAssetAddress + mapped, {
        headers: {
          'X-API-KEY': process.env.OPENSEA,
        },
      })
    }

    const popFromArray = (value) => {
      const index = metaData.value.map((e) => e.token_id).indexOf(value)
      metaData.value.splice(index, 1)
    }

    return {
      userRealms,
      activeNetworkId,
      stakeRealm,
      claimResources,
      claimBalance,
      realmBalance,
      loading,
      error,
      result,
      realmsLoading,
      metaData,
      popFromArray,
    }
  },
})
</script>
