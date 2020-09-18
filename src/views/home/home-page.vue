<style lang="sass" scoped>
@import 'src/styles/app.variables'

.home-page-main
  padding: 100px 12px 12px 12px

  body.screen--lg &, body.screen--xl &
    margin-top: 48px
  body.screen--md &
    margin: 24px
  body.screen--xs &, body.screen--sm &
    margin: 12px

.hello-world
  margin-top: 50px
</style>

<template>
  <div class="home-page-main layout vertical center">
    <div><img alt="Vue logo" src="../../assets/logo.png" /></div>
    <hello-world ref="helloWorld" class="hello-world" msg="Welcome to Your Vue 2 + Composition API" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from '@vue/composition-api'
import { HelloWorld } from './hello-world'

export default defineComponent({
  name: 'HomePage',

  components: {
    HelloWorld: require('./hello-world').default,
  },

  setup() {
    const helloWorld = ref<HelloWorld>()

    onMounted(() => {
      helloWorld.value!.hello()
    })

    return {
      helloWorld,
    }
  },
})
</script>
