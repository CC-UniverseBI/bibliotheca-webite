<template>
  <div>
    <div v-if="!icon && realmStatistics" class="text-left">
      Defence: {{ realmStatistics[0] }} <br />
      Offence: {{ offence }}
    </div>
    <div v-else class="flex space-x-2">
      <v-popover v-if="realmStatistics" trigger="hover">
        <button>
          <span class="text-2xl">⚔️</span>
        </button>

        <template slot="popover">
          <div
            class="
              bg-gray-300
              shadow-xl
              p-4
              rounded
              text-black
              flex
              justify-between
            "
          >
            <div class="flex flex-col pr-2">
              <span>Defence:</span>
              <span>Offence:</span>
              <!-- <span>Magic:</span> -->
            </div>
            <div class="flex flex-col">
              <span>{{ realmStatistics[0] }}</span>
              <span>{{ offence }}</span>
              <!-- <span>{{ realmStatistics[2] }}</span> -->
            </div>
          </div>
        </template>
      </v-popover>
      <v-popover v-if="realmStatistics" trigger="hover">
        <button>
          <span class="text-2xl">🍎</span>
        </button>

        <template slot="popover">
          <div
            class="
              bg-gray-300
              shadow-xl
              p-4
              rounded
              text-black
              flex
              justify-between
            "
          >
            <div class="flex flex-col pr-2">
              <span>Population:</span>
              <span>Food Supply:</span>
            </div>
            <div class="flex flex-col">
              <span>{{ realmStatistics[4] }}</span>
              <span>{{ realmStatistics[3] }}</span>
            </div>
          </div>
        </template>
      </v-popover>
    </div>
  </div>
</template>
<script>
import { useFetch } from '@nuxtjs/composition-api'
import { defineComponent } from '@vue/composition-api'
import { useStatistics } from '~/composables/statistics/useStatistics'
export default defineComponent({
  fetchOnServer: false,
  props: {
    realm: {
      type: String,
      required: true,
    },
    icon: {
      type: Boolean,
      default: true,
      required: false,
    },
    offence: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const { getStatistics, realmStatistics } = useStatistics()

    useFetch(async () => {
      await getStatistics(props.realm)
    })

    return {
      getStatistics,
      realmStatistics,
    }
  },
})
</script>
