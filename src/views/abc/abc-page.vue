<style lang="sass" scoped>
@import 'src/styles/app.variables'

.abc-page
  padding: 12px
  body.screen--lg &, body.screen--xl &
    margin: 48px
  body.screen--md &
    margin: 24px
  body.screen--xs &, body.screen--sm &
    margin: 12px

.greet-message
  --greet-message-color: $indigo-12

.custom-input
  width: 200px

.space-x
  width: 20px

.title
  @extend %text-subtitle1
  font-weight: map_get($text-weights, "medium")

.value
  @extend %text-subtitle1
</style>

<template>
  <q-card class="abc-page">
    <div class="app-my-16">{{ $t('hello', { today: $d(new Date(), 'dateSec') }) }}</div>
    <q-input ref="messageInput" v-model="state.message" label="Input Message" />
    <div class="app-my-16">
      <span class="title">propA: </span><span class="value">{{ propA }}</span>
    </div>
    <div class="app-my-16">
      <span class="title">propB: </span><span class="value">{{ propB }}</span>
    </div>
    <div class="app-my-16">
      <span class="title">message: </span><span class="value">{{ state.message }}</span>
    </div>
    <div class="app-my-16">
      <span class="title">reversed message: </span><span class="value">{{ reversedMessage }}</span>
    </div>
    <div class="app-my-16">
      <span class="title">double reversed message: </span>
      <span class="value">{{ doubleReversedMessage }}</span>
    </div>
    <div class="layout horizontal center app-my-16">
      <greet-message ref="greetMessage" :message="state.message" class="greet-message" />
      <q-btn flat rounded color="primary" label="Greet" class="app-ml-12" @click="greetButtonOnClick" />
    </div>
    <div class="app-my-16">
      <span class="title">post times: </span><span class="value">{{ state.post.times }}</span>
      <q-btn flat rounded color="primary" label="Post" class="app-ml-12" @click="postButtonOnClick" />
    </div>
    <div class="layout horizontal center app-my-16">
      <q-input ref="messageInput" class="custom-input" v-model="state.customInputValue" label="AbcPage Value" dense />
      <span class="space-x" />
      <custom-input v-model="state.customInputValue" class="flex-3" />
    </div>
    <div class="layout horizontal center app-my-16">
      <div class="layout horizontal center">
        <span class="app-mr-4">AbcPage:</span>
        <input type="checkbox" v-model="state.customChecked" />
      </div>
      <span class="space-x" />
      <custom-checkbox v-model="state.customChecked" />
    </div>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch, watchEffect } from '@vue/composition-api'
import { GreetMessage } from '@/views/abc/greet-message.vue'
import { Screen } from 'quasar'

interface AbcPageProps {
  propA: string
  propB: string
}

interface Post {
  message: string
  times: number
}

export default defineComponent<AbcPageProps>({
  name: 'AbcPage',

  components: {
    GreetMessage: require('@/views/abc/greet-message.vue').default,
    CustomInput: require('@/views/abc/custom-input.vue').default,
    CustomCheckbox: require('@/views/abc/custom-checkbox.vue').default,
  },

  props: {
    propA: { type: String, default: 'prop value A' },
    propB: { type: String, default: 'prop value B' },
  },

  setup(props, context) {
    const state = reactive({
      message: '',
      post: {
        message: '',
        times: 0,
      } as Post,
      customInputValue: '',
      customChecked: false,
    })

    const greetMessage = ref<GreetMessage>()

    onMounted(() => {
      state.message = 'onMounted'
    })

    const reversedMessage = computed(() =>
      state.message
        .split('')
        .reverse()
        .join('')
    )

    const doubleReversedMessage = computed(() =>
      reversedMessage.value
        .split('')
        .reverse()
        .join('')
    )

    const greetButtonOnClick = () => {
      greetMessage.value!.greet()
    }

    const postButtonOnClick = () => {
      console.log(Screen.name)
      state.post.times++
    }

    watchEffect(() => {
      state.post.message = state.message
    })

    watch(
      () => state.post,
      (newValue, oldValue) => {
        console.log(
          `post:\n  oldValue: { message: "${newValue.message}", times: ${newValue.times} }\n  newValue: { message: "${newValue.message}", times: ${newValue.times} }`
        )
      },
      { deep: true }
    )

    watch(
      () => state.post.times,
      (newValue, oldValue) => {
        console.log('post.times:\n  oldValue:', oldValue, '\n  newValue:', newValue)
      }
    )

    return {
      state,
      greetMessage,
      reversedMessage,
      doubleReversedMessage,
      greetButtonOnClick,
      postButtonOnClick,
    }
  },
})
</script>

<i18n>
en:
  hello: "Hello World! Today is {today}."
ja:
  hello: "こんにちは、世界！ 今日は {today} です。"
</i18n>
