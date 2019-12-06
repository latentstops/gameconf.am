<template>
  <div id="app">
    <keep-alive>
      <WebGLBackground :mode="webGlMode" :section="section"/>
    </keep-alive>
  </div>
</template>

<script>
import WebGLBackground from './components/WebGLBackground.vue'
import FirePrerenderEvent from '@/mixins/FirePrerenderEvent'
import Viewport from '@/mixins/Viewport'
export default {
  name: 'app',
  data() {
    return {
      webGlMode: 'splash',
      // section: 'tickets',
      // section: 'intro',
      // section: 'tickets',
      // section: 'venue',
      section: 'contact',
    }
  },
  mixins: [FirePrerenderEvent, Viewport],
  components: {
    WebGLBackground
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
