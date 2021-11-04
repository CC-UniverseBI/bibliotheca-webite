<template>
  <div class="sprite-view-frame bottom-0 z-20">
    <div :class="{ inverse: inverse }" class="sprite-renderer"></div>
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    inverse: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
})
</script>

<style scoped>
.sprite-view-frame {
  width: 155px;
  height: 114px;
  overflow: hidden; /* this will hide any sprites outside of the frame*/
}
.sprite-renderer {
  width: 155px;
  height: 155px;
  background-image: url('~/assets/img/Attack_1.png'); /* the sprite sheet */
  background-repeat: no-repeat;

  /* this prevents the browser from aliasing our pixel art image and making it blurry */
  -ms-interpolation-mode: nearest-neighbor;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: -o-pixelated;
  image-rendering: pixelated;

  /* this is where the magic happens! */
  animation: animateSprites 1s infinite steps(6);
}

@keyframes animateSprites {
  0% {
    background-position: 0px;
  }
  100% {
    background-position: calc(155px * 6 * -1);
  }
}

.sprite-renderer.inverse {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
