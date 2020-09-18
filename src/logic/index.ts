import { AuthLogic, createAuthLogic } from '@/logic/modules/auth'
import { InjectionKey, provide, reactive } from '@vue/composition-api'
import { InternalLogicKey, createInternalLogic } from '@/logic/modules/internal'
import { ShopLogic, createShopLogic } from '@/logic/modules/shop'
import { StoreContainerKey, createStoreContainer } from '@/logic/store'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface LogicContainer {
  readonly shop: ShopLogic
  readonly auth: AuthLogic
}

//========================================================================
//
//  Implementation
//
//========================================================================

function createLogicContainer(): LogicContainer {
  provide(StoreContainerKey, createStoreContainer())
  provide(InternalLogicKey, createInternalLogic())

  const state = reactive({
    shop: createShopLogic(),
    auth: createAuthLogic(),
  })

  return {
    shop: state.shop,
    auth: state.auth,
  }
}

const LogicContainerKey: InjectionKey<LogicContainer> = Symbol('LogicContainer')

//========================================================================
//
//  Export
//
//========================================================================

export * from '@/logic/types'
export { LogicContainerKey, createLogicContainer }
