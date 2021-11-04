<template>
  <div>
    <v-popover trigger="hover">
      <button>
        <span class="text-2xl">{{ returnHappinessEmoji.emoji }}</span>
      </button>

      <template slot="popover">
        <div class="bg-gray-300 shadow-xl p-4 rounded text-black w-72">
          <h4 class="mb-4">Realm Happiness: {{ happiness }}</h4>
          <span>Resource Production: {{ (happiness / 100) * 100 }}%</span>
          <br />
          <span class="italic">"{{ returnHappinessEmoji.text }}"</span>
        </div>
      </template>
    </v-popover>
  </div>
</template>
<script>
import { computed, defineComponent, onMounted } from '@vue/composition-api'
import { useStatistics } from '~/composables/statistics/useStatistics'
export default defineComponent({
  props: {
    realm: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { getHappiness, happiness } = useStatistics()

    const scale = [
      {
        text: 'Your people love you. You are showered in rose petals everytime you walk the streets.',
        emoji: '😄',
      },
      {
        text: 'You are liked by your people, they often slay lambs in your name.',
        emoji: '😊',
      },
      {
        text: 'You are seen as an ok leader, however, you could be doing more.',
        emoji: '🙂',
      },
      { text: 'You are neither liked or disliked.', emoji: '😐' },
      {
        text: 'You are starting to anger the citizens of the Realm. It would be wise to assess your decisions.',
        emoji: '🙁',
      },
      {
        text: 'You are heavily disliked due to your warmongering. We suggest your improve your basic resources.',
        emoji: '😠',
      },
      {
        text: 'Your people hate you, and have summoned the vengeance of the Dark Lord Grug.',
        emoji: '😡',
      },
    ]

    onMounted(async () => {
      await getHappiness(props.realm)
    })

    const returnHappinessEmoji = computed(() => {
      if (happiness.value === 150) {
        return scale[0]
      } else if (happiness.value >= 125) {
        return scale[1]
      } else if (happiness.value > 100) {
        return scale[2]
      } else if (happiness.value >= 100) {
        return scale[3]
      } else if (happiness.value >= 75) {
        return scale[4]
      } else if (happiness.value >= 50) {
        return scale[5]
      } else {
        return 0
      }
    })
    return {
      scale,
      happiness,
      returnHappinessEmoji,
    }
  },
})
</script>
