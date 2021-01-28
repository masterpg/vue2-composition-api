import { ServiceContainer, User } from '@/service'
import VGreetMessage, { GreetMessage } from '@/views/abc/greet-message.vue'
import { mount, shallowMount } from '@vue/test-utils'
import { AuthService } from '@/service/modules/auth'
import { computed } from '@vue/composition-api'
import { provideDependencyToVue } from '../../../helper'

describe('GreetMessage', () => {
  it('template', () => {
    const userName = 'Taro'
    const message = 'abcdefg'

    const wrapper = shallowMount<GreetMessage>(VGreetMessage, {
      propsData: { message },
      setup() {
        provideDependencyToVue(({ service }) => {
          td.replace<AuthService, 'isSignedIn'>(
            service.auth,
            'isSignedIn',
            computed(() => true)
          )
          td.replace<AuthService, 'user'>(service.auth, 'user', {
            displayName: userName,
          })
        })
      },
    })

    console.log(wrapper.text())
    expect(wrapper.text()).toMatch(`Hi ${userName}!`)
    expect(wrapper.text()).toMatch(/Today is \d\d\/\d\d\/\d\d, \d\d:\d\d:\d\d (?:AM|PM)\./)
  })

  it('greet', () => {
    const userName = 'Taro'
    const message = 'abcdefg'

    const wrapper = shallowMount<GreetMessage & { service: ServiceContainer }>(VGreetMessage, {
      propsData: { message },
      setup() {
        const { service } = provideDependencyToVue(({ service }) => {
          td.replace<AuthService, 'validateSignedIn'>(service.auth, 'validateSignedIn')
          td.replace<User, 'displayName'>(service.auth.user, 'displayName', userName)
        })
        return { service }
      },
    })
    const { service, ...greetMessage } = wrapper.vm

    // テスト対象実行
    const actual = greetMessage.greet()

    // 戻り値の検証
    expect(actual).toBe(`Hi ${userName}, ${message}.`)

    // validateSignedInの呼び出しを検証
    const exp = td.explain(service.auth.validateSignedIn)
    expect(exp.calls.length).toBe(1) // 1回呼び出されるはず
    expect(exp.calls[0].args[0]).toBeUndefined() // 1回目の呼び出しが引数なしなはず
  })
})
