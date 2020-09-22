import { HelloWorld, HelloWorldProps, setupHelloWorld } from '@/components/hello-world/script'
import HelloWorldTemplate from '@/components/hello-world/template.vue'
import { defineComponent } from '@vue/composition-api'

export default defineComponent<HelloWorldProps, HelloWorld>({
  name: 'HelloWorld',

  mixins: [HelloWorldTemplate],

  props: {
    title: { type: String },
  },

  setup: setupHelloWorld,
})

export { HelloWorld }
