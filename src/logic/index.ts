import { AuthLogic, createAuthLogic } from '@/logic/modules/auth'
import { InjectionKey, inject, provide } from '@vue/composition-api'
import { ShopLogic, createShopLogic } from '@/logic/modules/shop'
import { provideInternalLogic } from '@/logic/modules/internal'
import { provideStore } from '@/logic/store'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface LogicContainer {
  readonly auth: AuthLogic
  readonly shop: ShopLogic
}

//========================================================================
//
//  Implementation
//
//========================================================================

const LogicKey: InjectionKey<LogicContainer> = Symbol('Logic')

function createLogic(): LogicContainer {
  return {
    auth: createAuthLogic(),
    shop: createShopLogic(),
  }
}

function provideLogic(): void {
  provideStore()
  provideInternalLogic()
  provide(LogicKey, createLogic())
}

function injectLogic(): LogicContainer {
  validateLogicProvided()
  return inject(LogicKey)!
}

function validateLogicProvided(): void {
  const result = inject(LogicKey)
  if (!result) {
    throw new Error(`${LogicKey} is not provided`)
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export * from '@/logic/types'
export { provideStore } from '@/logic/store'
export { LogicContainer, LogicKey, provideLogic, injectLogic, validateLogicProvided }
