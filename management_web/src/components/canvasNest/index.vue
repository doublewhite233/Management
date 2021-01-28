<template>
  <div id="canvas_nest_container">
    <vue-canvas-nest :config="config" :el="'#canvas_nest_container'" />
  </div>
</template>

<script>
import vueCanvasNest from 'vue-canvas-nest'

export default {
  data() {
    return {
      config: {
        color: '255,255,255',
        pointColor: '255,255,255',
        opacity: 0.5,
        zIndex: 0,
        count: 150
      }
    }
  },
  components: {
    vueCanvasNest
  }
}
</script>

<style scoped>
#canvas_nest_container {
  width: 100%;
  height: 100%;
}
</style>
