<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="">
          <div class="text-xl font-display">
            Realm ID:
            {{ result.raiderRealm.id }}
          </div>
          <div>
            Raider:
            {{ getRaiderId }}
          </div>
          <div class="text-red-600 font-semibold">
            Units Lost: {{ result.raiderUnitsLost }}
          </div>
        </div>
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-xl font-display">
        Realm ID: {{ result.defenderRealm.id }}
      </div>
      <div>
        {{ result.defender.id }}
      </div>
      <div class="text-red-600 font-semibold">
        Units Lost: {{ result.defenderUnitsLost }}
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <span
        :class="{
          'bg-green-100 text-green-800': result.resourcesPillaged.length,
        }"
        class="
          p-4
          inline-flex
          text-2xl
          leading-5
          font-semibold
          rounded-full
          bg-red-100
          text-red-800
        "
      >
        {{ result.result }}
      </span>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      {{ getTime(result.timestamp) }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="result.resourcesPillaged.length">
        <SuccessfulRaidedResource
          v-for="(resource, index) in result.resourcesPillaged"
          :key="index"
          :resource="resource.id"
          vault="1"
          :value="result.resourcesValuesPillaged[index]"
          class="my-1 flex justify-between rounded font-semibold"
        />
      </div>
      <div v-else class="px-6 py-4 whitespace-nowrap font-semibold">
        Raid Unsuccessful
      </div>
    </td>
  </tr>
</template>
<script>
import dayjs from 'dayjs'
import { computed } from '@nuxtjs/composition-api'
import { useWeb3 } from '~/composables/web3'
export default {
  props: {
    result: {
      type: Object,
      default: null,
    },
  },

  setup(props) {
    const { account } = useWeb3()
    const getTime = (timestamp) => {
      return dayjs.unix(timestamp).format('DD MMM YYYY HH:mm:ss')
    }
    const getRaiderId = computed(() => {
      if (account.value?.toLowerCase() === props.result.raiderRealm.id) {
        return 'Your Realm'
      } else {
        return props.result.raider.id
      }
    })
    return {
      getTime,
      getRaiderId,
      account,
    }
  },
}
</script>
