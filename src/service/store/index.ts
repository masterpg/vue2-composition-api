import { CartStore } from '@/service/store/cart'
import { ProductStore } from '@/service/store/product'
import { UserStore } from '@/service/store/user'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface StoreContainer {
  readonly user: UserStore
  readonly product: ProductStore
  readonly cart: CartStore
}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace StoreContainer {
  export function newInstance(): StoreContainer {
    return newRawInstance()
  }

  export function newRawInstance() {
    const user = UserStore.newRawInstance()
    const product = ProductStore.newRawInstance()
    const cart = CartStore.newRawInstance()
    return { user, product, cart }
  }
}

//========================================================================
//
//  Dependency Injection
//
//========================================================================

let instance: StoreContainer

function provideStore(store: StoreContainer): void {
  instance = store
}

function injectStore(): StoreContainer {
  if (!instance) {
    throw new Error(`'StoreContainer' is not provided`)
  }
  return instance
}

//========================================================================
//
//  Export
//
//========================================================================

export { StoreContainer, injectStore, provideStore }
export { generateId } from '@/service/store/base'
