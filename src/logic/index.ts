import { APIContainer, provideAPI } from '@/logic/api'
import { InternalLogic, provideInternalLogic } from '@/logic/modules/internal'
import { StoreContainer, provideStore } from '@/logic/store'
import { AuthLogic } from '@/logic/modules/auth'
import { LogicDependency } from '@/logic/base'
import { ShopLogic } from '@/logic/modules/shop'

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

namespace LogicContainer {
  export function newInstance(): LogicContainer {
    return newRawInstance()
  }

  export function newRawInstance(options?: Partial<LogicDependency>) {
    const api = options?.api ?? APIContainer.newRawInstance()
    provideAPI(api)
    const store = options?.store ?? StoreContainer.newRawInstance()
    provideStore(store)
    const internal = options?.internal ?? InternalLogic.newRawInstance()
    provideInternalLogic(internal)

    return {
      auth: AuthLogic.newRawInstance(),
      shop: ShopLogic.newRawInstance(),
    }
  }
}

//========================================================================
//
//  Dependency Injection
//
//========================================================================

let instance: LogicContainer

function provideLogic(logic?: LogicContainer): void {
  instance = logic ?? LogicContainer.newInstance()
}

function injectLogic(): LogicContainer {
  if (!instance) {
    throw new Error(`'LogicContainer' is not provided`)
  }
  return instance
}

//========================================================================
//
//  Export
//
//========================================================================

export { LogicContainer, injectLogic, provideLogic }
export * from '@/logic/base'
