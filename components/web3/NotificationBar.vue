<template>
  <div
    v-if="queue.length"
    class="fixed top-0 right-0 w-full px-2 pt-8 sm:max-w-sm z-50"
  >
    <transition-group
      appear
      enter-active-class="slideInUp"
      leave-active-class="fadeOutRight"
      tag="div"
      class="flex flex-col w-full px-2 pb-4 space-y-4"
    >
      <Notification
        v-for="item in queue"
        :key="item.key"
        v-bind="item"
        class="mr-2"
        @dismiss="close(item.key)"
      />
    </transition-group>
    <BButton v-if="queue.length > 1" type="primary" @click.native="closeAll">
      Clear all
    </BButton>
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'
import { useNotification } from '~/composables/useNotification'

export default defineComponent({
  setup() {
    const { queue, close, closeAll } = useNotification()
    return { queue, close, closeAll }
  },
})
</script>

<style>
@keyframes slideInUp {
  from {
    transform: translate3d(0, 100%, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}
.slideInUp {
  animation-name: slideInUp;
  animation-duration: 150ms;
}
@keyframes fadeOutRight {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
}
.fadeOutRight {
  animation-name: fadeOutRight;
  animation-duration: 150ms;
}
</style>
