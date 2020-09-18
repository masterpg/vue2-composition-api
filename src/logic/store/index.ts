import { CartStore, createCartStore } from '@/logic/store/cart'
import { InjectionKey, reactive } from '@vue/composition-api'
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

function createStoreContainer(): StoreContainer {
  const state = reactive({
    user: createUserStore(),
    product: createProductStore(),
    cart: createCartStore(),
  })

  return {
    user: state.user,
    product: state.product,
    cart: state.cart,
  }
}

const StoreContainerKey: InjectionKey<StoreContainer> = Symbol('StoreContainer')

//========================================================================
//
//  Export
//
//========================================================================

export { StoreContainerKey, createStoreContainer }
