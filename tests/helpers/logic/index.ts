import { InternalLogic, InternalLogicKey, injectInternalLogic } from '@/logic/modules/internal'
import { LogicContainer, LogicKey, provideLogic as _provideLogic, injectLogic } from '@/logic'
import { StoreContainer, StoreKey, injectStore } from '@/logic/store'
import { provide } from '@vue/composition-api'
import { shallowMount } from '@vue/test-utils'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface ProvidedLogic {
  logic: LogicContainer
  internal: InternalLogic
  store: StoreContainer
}

//========================================================================
//
//  Implementation
//
//========================================================================

let provided: ProvidedLogic | null

/**
 * ロジック構成に必要なオブジェクトをアプリケーションに登録します。
 * 引数の`setup`を指定しない場合、デフォルトのオブジェクトが登録されます。
 * @param setup
 *   デフォルトで登録されたオブジェクトに対しモック設定を行う関数を指定します。
 *   引数にはデフォルトで登録されたオブジェクトが渡ってきます。必要であればこのオブジェクトに
 *   モック設定を行ってください。引数のオブジェクトではなくモックオブジェクトをアプリケーション
 *   に登録したい場合、戻り値としてモックオブジェクトを返すようにしてください。
 */
function provideLogic(setup?: (provided: ProvidedLogic) => Partial<ProvidedLogic> | void): ProvidedLogic {
  const wrapper = shallowMount<ProvidedLogic & Vue>({
    template: '<div></div>',
    setup() {
      if (!provided) {
        _provideLogic()
        provided = {
          logic: injectLogic(),
          internal: injectInternalLogic(),
          store: injectStore(),
        }
      }

      if (setup) {
        const setupResult = setup(provided)
        if (setupResult) {
          const { logic, internal, store } = setupResult
          if (logic) {
            provided.logic = logic
            provide(StoreKey, provided.store)
          }
          if (internal) {
            provided.internal = internal
            provide(InternalLogicKey, provided.internal)
          }
          if (store) {
            provided.store = store
            provide(LogicKey, provided.logic)
          }
        }
      }

      const { logic, internal, store } = provided
      return { logic, internal, store }
    },
  })

  const { logic, internal, store } = wrapper.vm
  return { logic, internal, store }
}

function clearProvidedLogic(): void {
  provided = null
}

let providedToElement: ProvidedLogic | null

/**
 * ロジック構成に必要なオブジェクトをVueコンポーネントに登録します。
 * 引数の`setup`を指定しない場合、デフォルトのオブジェクトが登録されます。
 * @param setup
 *   デフォルトで登録されたオブジェクトに対しモック設定を行う関数を指定します。
 *   引数にはデフォルトで登録されたオブジェクトが渡ってきます。必要であればこのオブジェクトに
 *   モック設定を行ってください。引数のオブジェクトではなくモックオブジェクトをVueコンポーネント
 *   に登録したい場合、戻り値としてモックオブジェクトを返すようにしてください。
 */
function provideLogicToElement(setup?: (provided: ProvidedLogic) => Partial<ProvidedLogic> | void): ProvidedLogic {
  if (!providedToElement) {
    _provideLogic()
    providedToElement = {
      logic: injectLogic(),
      internal: injectInternalLogic(),
      store: injectStore(),
    }
  }

  if (setup) {
    const setupResult = setup(providedToElement)
    if (setupResult) {
      const { logic, internal, store } = setupResult
      if (logic) {
        providedToElement.logic = logic
        provide(StoreKey, providedToElement.store)
      }
      if (internal) {
        providedToElement.internal = internal
        provide(InternalLogicKey, providedToElement.internal)
      }
      if (store) {
        providedToElement.store = store
        provide(LogicKey, providedToElement.logic)
      }
    }
  }

  const { logic, internal, store } = providedToElement
  return { logic, internal, store }
}

function clearProvidedLogicToElement(): void {
  providedToElement = null
}

//========================================================================
//
//  Exports
//
//========================================================================

export { provideLogic, clearProvidedLogic, provideLogicToElement, clearProvidedLogicToElement, ProvidedLogic }
