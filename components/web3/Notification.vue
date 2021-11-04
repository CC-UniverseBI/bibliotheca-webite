<template>
  <div
    class="
      flex flex-wrap
      w-full
      pl-4
      bg-gray-900
      rounded
      border-2 border-gray-600 border-opacity-75
      shadow-lg
      dark:bg-dark-300
      border-grey-light
    "
  >
    <div class="flex w-full p-1">
      <button class="ml-auto" @click="dismiss">
        <CloseIcon class="w-full" />
      </button>
    </div>
    <div class="flex items-center w-full py-4">
      <!-- Notification with link  -->
      <template v-if="href">
        <div class="flex flex-col w-full px-4">
          <div class="text-xl font-display text-12" :class="{ 'mb-2': !!body }">
            {{ title }}
          </div>
          <a
            :href="href"
            target="_blank"
            rel="noopener noreferrer"
            class="
              inline-flex
              items-center
              text-ocean-blue-pure
              dark:text-light dark:hover:text-white
              text-12
            "
          >
            <div class="">
              {{ body }}
              <Icon name="external-link" class="inline-block w-4 h-4" />
            </div>
          </a>
        </div>
      </template>

      <!-- Notification without link  -->
      <template v-else>
        <div class="flex flex-col w-full px-4">
          <div
            class="text-2xl font-display text-12"
            :class="{ 'mb-2': !!body }"
          >
            {{ title }}
          </div>
          <div class="text-xl">
            {{ body }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from '@nuxtjs/composition-api'
import CloseIcon from '@/assets/img/x-square.svg?inline'
export default defineComponent({
  components: {
    CloseIcon,
  },
  props: {
    title: { type: String, deafult: '' },
    body: { type: String, deafult: '' },
    href: { type: String, deafult: '' },
    icon: { type: String, deafult: '' },
    duration: { type: Number, deafult: 7000 },
  },
  setup(props, ctx) {
    function dismiss() {
      ctx.emit('dismiss')
    }
    onMounted(() => {
      if (props && props.duration) {
        setTimeout(dismiss, props.duration)
      }
    })
    return { dismiss }
  },
})
</script>
