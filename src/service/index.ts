import { APIContainer, provideAPI } from '@/service/api'
import { InternalService, provideInternalService } from '@/service/modules/internal'
import { StoreContainer, provideStore } from '@/service/store'
import { AuthService } from '@/service/modules/auth'
import { ServiceDependency } from '@/service/base'
import { ShopService } from '@/service/modules/shop'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface ServiceContainer {
  readonly auth: AuthService
  readonly shop: ShopService
}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace ServiceContainer {
  export function newInstance(): ServiceContainer {
    return newRawInstance()
  }

  export function newRawInstance(options?: Partial<ServiceDependency>) {
    const api = options?.api ?? APIContainer.newRawInstance()
    provideAPI(api)
    const store = options?.store ?? StoreContainer.newRawInstance()
    provideStore(store)
    const internal = options?.internal ?? InternalService.newRawInstance()
    provideInternalService(internal)

    return {
      auth: AuthService.newRawInstance(),
      shop: ShopService.newRawInstance(),
    }
  }
}

//========================================================================
//
//  Dependency Injection
//
//========================================================================

let instance: ServiceContainer

function provideService(service?: ServiceContainer): void {
  instance = service ?? ServiceContainer.newInstance()
}

function injectService(): ServiceContainer {
  if (!instance) {
    throw new Error(`'ServiceContainer' is not provided`)
  }
  return instance
}

//========================================================================
//
//  Export
//
//========================================================================

export { ServiceContainer, injectService, provideService }
export * from '@/service/base'
