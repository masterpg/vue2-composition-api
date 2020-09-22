import { CartItem, CheckoutStatus, Product } from '@/logic/types'
import { ComputedRef } from '@vue/composition-api'
import { DeepReadonly } from 'web-base-lib'
import { TestData } from '@/logic/test-data'
import dayjs from 'dayjs'
import { injectInternalLogic } from '@/logic/modules/internal'
import { injectStore } from '@/logic/store'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface ShopLogic {
  readonly products: DeepReadonly<Product>[]

  readonly cartItems: DeepReadonly<CartItem>[]

  readonly cartTotalPrice: ComputedRef<number>

  checkoutStatus: ComputedRef<CheckoutStatus>

  fetchProducts(): Promise<Product[]>

  fetchCartItems(): Promise<CartItem[]>

  addItemToCart(productId: string): Promise<void>

  removeItemFromCart(productId: string): Promise<void>

  checkout(): Promise<void>
}

//========================================================================
//
//  Implementation
//
//========================================================================

function createShopLogic(): ShopLogic {
  //----------------------------------------------------------------------
  //
  //  Variables
  //
  //----------------------------------------------------------------------

  const internal = injectInternalLogic()
  const store = injectStore()

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  const fetchProducts: ShopLogic['fetchProducts'] = async () => {
    // 本来ならAPIを呼び出すのだが、擬似コードで対応
    store.product.setAll(TestData.products)
    return store.product.all.map(product => store.product.clone(product))
  }

  const fetchCartItems: ShopLogic['fetchCartItems'] = async () => {
    internal.auth.validateSignedIn()

    // 本来ならAPIを呼び出すのだが、擬似コードで対応
    store.cart.setAll(TestData.cartItems)
    return store.cart.all.map(cartItem => store.cart.clone(cartItem))
  }

  const addItemToCart: ShopLogic['addItemToCart'] = async productId => {
    internal.auth.validateSignedIn()

    const product = store.product.sgetById(productId)
    if (product.stock <= 0) {
      throw new Error(`Out of stock.`)
    }

    const cartItem = store.cart.getByProductId(productId)

    try {
      if (!cartItem) {
        await addCartItem(productId)
      } else {
        await updateCartItem(productId, 1)
      }
    } catch (err) {
      console.error(err)
      return
    }

    store.cart.setCheckoutStatus(CheckoutStatus.None)
  }

  const removeItemFromCart: ShopLogic['removeItemFromCart'] = async productId => {
    internal.auth.validateSignedIn()

    const cartItem = store.cart.sgetByProductId(productId)

    try {
      if (cartItem.quantity > 1) {
        await updateCartItem(productId, -1)
      } else {
        await removeCartItem(productId)
      }
    } catch (err) {
      console.error(err)
      return
    }

    store.cart.setCheckoutStatus(CheckoutStatus.None)
  }

  const checkout: ShopLogic['checkout'] = async () => {
    internal.auth.validateSignedIn()

    try {
      // 本来ならここにAPIを呼び出すコードが記述される
      if (getRandomInt(2) === 0) {
        throw new Error('Failed to check out.')
      }
    } catch (err) {
      console.log(err)
      store.cart.setCheckoutStatus(CheckoutStatus.Failed)
      return
    }

    store.cart.setAll([]) // カートを空にする
    store.cart.setCheckoutStatus(CheckoutStatus.Successful)
  }

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  async function addCartItem(productId: string): Promise<void> {
    const product = store.product.sgetById(productId)!
    const newCartItem = {
      productId,
      title: product.title,
      price: product.price,
      quantity: 1,
    }

    // 本来ならAPIを呼び出すのだが、擬似コードで対応
    const now = dayjs()
    const apiResponse = {
      ...newCartItem,
      id: internal.helper.generateId(),
      uid: store.user.value.id,
      createdAt: now,
      updatedAt: now,
      product: {
        id: product.id,
        stock: product.stock - 1,
      },
    }

    store.product.set(apiResponse.product)
    store.cart.add(apiResponse)
  }

  async function updateCartItem(productId: string, quantity: number): Promise<void> {
    const cartItem = store.cart.sgetByProductId(productId)
    const updateCartItem = {
      ...cartItem,
      quantity: cartItem.quantity + quantity,
    }

    // 本来ならAPIを呼び出すのだが、擬似コードで対応
    const product = store.product.sgetById(productId)
    const now = dayjs()
    const apiResponse = {
      ...updateCartItem,
      updatedAt: now,
      product: {
        id: product.id,
        stock: product.stock - quantity,
      },
    }

    store.product.set(apiResponse.product)
    store.cart.set(apiResponse)
  }

  async function removeCartItem(productId: string): Promise<void> {
    const cartItem = store.cart.sgetByProductId(productId)

    // 本来ならAPIを呼び出すのだが、擬似コードで対応
    const product = store.product.sgetById(productId)
    const apiResponse = {
      ...cartItem,
      product: {
        id: product.id,
        stock: product.stock + 1,
      },
    }

    store.product.set(apiResponse.product)
    store.cart.remove(apiResponse.id)
  }

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max))
  }

  //----------------------------------------------------------------------
  //
  //  Result
  //
  //----------------------------------------------------------------------

  return {
    products: store.product.all,
    cartItems: store.cart.all,
    checkoutStatus: store.cart.checkoutStatus,
    cartTotalPrice: store.cart.totalPrice,
    fetchProducts,
    fetchCartItems,
    addItemToCart,
    removeItemFromCart,
    checkout,
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { ShopLogic, createShopLogic }
