import { HelloWorld, HelloWorldProps, setupHelloWorld } from '@/views/home/hello-world/script'
import HogeTemplate from '@/views/home/hello-world/template.vue'
import { defineComponent } from '@vue/composition-api'

export default defineComponent<HelloWorldProps, HelloWorld>({
  name: 'HelloWorld',

  mixins: [HogeTemplate],

  props: {
    msg: { type: String },
  },

  setup: setupHelloWorld,
})

export { HelloWorld }
