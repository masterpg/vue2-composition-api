import { CartItem, Product } from '@/service'
import { CartStore } from '@/service/store/cart'
import { DeepReadonly } from 'web-base-lib'
import { ProductStore } from '@/service/store/product'
import { StoreContainer } from '@/service/store'
import { UserStore } from '@/service/store/user'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface TestStoreContainer extends StoreContainer {
  readonly user: ReturnType<typeof UserStore['newRawInstance']>
  readonly product: ReturnType<typeof ProductStore['newRawInstance']>
  readonly cart: ReturnType<typeof CartStore['newRawInstance']>
}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace TestStoreContainer {
  export function newInstance(): TestStoreContainer {
    const base = StoreContainer.newRawInstance()
    return {
      ...base,
    }
  }
}

//--------------------------------------------------
//  Product
//--------------------------------------------------

/**
 * 指定されたアイテムがストアのコピーであることを検証します。
 * @param store
 * @param actual
 */
function toBeCopyProduct<T extends DeepReadonly<Product>>(store: TestStoreContainer, actual: T | T[]): void {
  const items = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  for (const item of items) {
    const stateItem = store.cart.state.all.find(stateItem => stateItem.id === item.id)
    expect(item).not.toBe(stateItem)
  }
}

//--------------------------------------------------
//  CartItem
//--------------------------------------------------

/**
 * 指定されたアイテムがストアのコピーであることを検証します。
 * @param store
 * @param actual
 */
function toBeCopyCartItem<T extends DeepReadonly<CartItem>>(store: TestStoreContainer, actual: T | T[]): void {
  const items = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  for (const item of items) {
    const stateItem = store.cart.state.all.find(stateItem => stateItem.id === item.id)
    expect(item).not.toBe(stateItem)
  }
}

//========================================================================
//
//  Exports
//
//========================================================================

export { TestStoreContainer, toBeCopyCartItem, toBeCopyProduct }
