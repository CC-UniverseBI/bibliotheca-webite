<template>
  <div>
    <span>
      Age Settled: {{ ageSettled }} <br />
      Age Last Claimed: {{ ageClaimed }}
    </span>
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'
export default defineComponent({
  props: {
    ageClaimed: {
      type: String,
      required: true,
    },
    ageSettled: {
      type: String,
      required: true,
    },
  },
})
</script>
