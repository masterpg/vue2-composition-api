import { CartItem, CheckoutStatus } from '@/logic/types'
import { ComputedRef, computed, reactive } from '@vue/composition-api'
import { DeepReadonly } from 'web-base-lib'
import { StatePartial } from '@/logic/store/base'
import dayjs from 'dayjs'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface CartStore {
  readonly all: DeepReadonly<CartItem>[]

  readonly totalPrice: ComputedRef<number>

  readonly checkoutStatus: ComputedRef<CheckoutStatus>

  getById(cartItemId: string): CartItem | undefined

  sgetById(cartItemId: string): CartItem

  getByProductId(productId: string): CartItem | undefined

  sgetByProductId(productId: string): CartItem

  setAll(items: CartItem[]): void

  set(item: StatePartial<Omit<CartItem, 'uid' | 'productId'>>): CartItem | undefined

  setCheckoutStatus(status: CheckoutStatus): void

  add(item: CartItem): CartItem

  remove(cartItemId: string): CartItem | undefined

  clear(): void

  clone(source: CartItem): CartItem
}

//========================================================================
//
//  Implementation
//
//========================================================================

function createCartStore(): CartStore {
  //----------------------------------------------------------------------
  //
  //  Variables
  //
  //----------------------------------------------------------------------

  const state = reactive({
    all: [] as CartItem[],
    checkoutStatus: CheckoutStatus.None,
  })

  //----------------------------------------------------------------------
  //
  //  Properties
  //
  //----------------------------------------------------------------------

  const checkoutStatus = computed(() => state.checkoutStatus)

  const totalPrice = computed(() => {
    const result = state.all.reduce((result, item) => {
      return result + item.price * item.quantity
    }, 0)
    return result
  })

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  const getById: CartStore['getById'] = cartItemId => {
    const stateItem = getStateCartItemById(cartItemId)
    return stateItem ? clone(stateItem) : undefined
  }

  const sgetById: CartStore['sgetById'] = cartItemId => {
    const result = getById(cartItemId)
    if (!result) {
      throw new Error(`The specified CartItem was not found: { id: "${cartItemId}" }`)
    }
    return result
  }

  const getByProductId: CartStore['getByProductId'] = productId => {
    const stateItem = state.all.find(item => item.productId === productId)
    return stateItem ? clone(stateItem) : undefined
  }

  const sgetByProductId: CartStore['sgetByProductId'] = productId => {
    const result = getByProductId(productId)
    if (!result) {
      throw new Error(`The specified CartItem was not found: { productId: "${productId}" }`)
    }
    return result
  }

  const setAll: CartStore['setAll'] = items => {
    state.all.splice(0)
    for (const item of items) {
      state.all.push(clone(item))
    }
  }

  const set: CartStore['set'] = item => {
    const stateItem = getStateCartItemById(item.id)
    if (!stateItem) {
      throw new Error(`The specified CartItem was not found: '${item.id}'`)
    }

    populate(item, stateItem)
    return clone(stateItem)
  }

  const setCheckoutStatus: CartStore['setCheckoutStatus'] = status => {
    state.checkoutStatus = status
  }

  const add: CartStore['add'] = item => {
    const stateItem = clone(item)
    state.all.push(stateItem)
    return clone(stateItem)
  }

  const remove: CartStore['remove'] = cartItemId => {
    let foundIndex = -1
    state.all.some((cartItem, index) => {
      if (cartItem.id === cartItemId) {
        foundIndex = index
        return true
      }
      return false
    })
    if (foundIndex >= 0) {
      const result = state.all[foundIndex]
      state.all.splice(foundIndex, 1)
      return result
    }
    return undefined
  }

  const clear: CartStore['clear'] = () => {
    state.checkoutStatus = CheckoutStatus.None
    state.all.splice(0, state.all.length)
  }

  const clone: CartStore['clone'] = source => {
    return populate(source, {})
  }

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  function getStateCartItemById(cartItemId: string): CartItem | undefined {
    return state.all.find(item => item.id === cartItemId)
  }

  function populate(from: Partial<CartItem>, to: Partial<CartItem>): CartItem {
    if (typeof from.id === 'string') to.id = from.id
    if (typeof from.uid === 'string') to.uid = from.uid
    if (typeof from.productId === 'string') to.productId = from.productId
    if (typeof from.title === 'string') to.title = from.title
    if (typeof from.price === 'number') to.price = from.price
    if (typeof from.quantity === 'number') to.quantity = from.quantity
    if (from.createdAt) to.createdAt = dayjs(from.createdAt)
    if (from.updatedAt) to.updatedAt = dayjs(from.updatedAt)
    return to as CartItem
  }

  //----------------------------------------------------------------------
  //
  //  Result
  //
  //----------------------------------------------------------------------

  return {
    all: state.all,
    checkoutStatus,
    totalPrice,
    getById,
    sgetById,
    getByProductId,
    sgetByProductId,
    setAll,
    set,
    setCheckoutStatus,
    add,
    remove,
    clear,
    clone,
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { CartStore, createCartStore }
