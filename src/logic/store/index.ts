import { CartStore, createCartStore } from '@/logic/store/cart'
import { InjectionKey, inject, provide } from '@vue/composition-api'
import { ProductStore, createProductStore } from '@/logic/store/product'
import { UserStore, createUserStore } from '@/logic/store/user'

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

const StoreKey: InjectionKey<StoreContainer> = Symbol('Store')

function createStore(): StoreContainer {
  return {
    user: createUserStore(),
    product: createProductStore(),
    cart: createCartStore(),
  }
}

function provideStore(): void {
  provide(StoreKey, createStore())
}

function injectStore(): StoreContainer {
  validateStoreProvided()
  return inject(StoreKey)!
}

function validateStoreProvided(): void {
  const value = inject(StoreKey)
  if (!value) {
    throw new Error(`${StoreKey.description} is not provided`)
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { StoreContainer, StoreKey, provideStore, injectStore, validateStoreProvided }
