<template>
  <div id="app">
    <meta charset="utf-8">
    <FaceTensor msg="Hi!"/>
  </div>
</template>

<script>
import FaceTensor from './components/Face.vue'

export default {
  name: 'App',
  components: {
    FaceTensor
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 10px;
}
</style>
