<style lang="sass" scoped>
@import 'src/styles/app.variables'

.title
  @extend %text-subtitle1
  font-weight: map_get($text-weights, "medium")

.value
  @extend %text-subtitle1

span
  color: var(--greet-message-color, $red-5)
</style>

<template>
  <div>
    <span class="title">greet times: </span><span class="value">{{ state.greetTimes }}</span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from '@vue/composition-api'

interface GreetMessageProps {
  message: string
}

export interface GreetMessage {
  greet(): void
}

export default defineComponent<GreetMessageProps, GreetMessage>({
  name: 'GreetMessage',

  props: {
    message: { type: String, default: '' },
  },

  setup(props, context) {
    const state = reactive({
      greetTimes: 0,
    })

    const greet = () => {
      alert(`greeting: ${props.message}`)
      state.greetTimes++
    }

    return {
      state,
      greet,
    }
  },
})
</script>
