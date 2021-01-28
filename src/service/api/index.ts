import { CartItem, Entity, OmitTimestamp, Product, TimestampEntity } from '@/service'
import { APIClient } from '@/service/api/client'
import dayjs from 'dayjs'

//========================================================================
//
//  Interfaces
//
//========================================================================

type RawEntity<T = unknown> = Entity &
  OmitTimestamp<T> & {
    createdAt: string
    updatedAt: string
  }

type ToEntity<T> = T extends undefined ? undefined : T extends null ? undefined : TimestampEntity<T>

interface APIContainer {
  getProduct(id: string): Promise<Product | undefined>

  getProducts(ids?: string[]): Promise<Product[]>

  getCartItem(id: string): Promise<CartItem | undefined>

  getCartItems(ids?: string[]): Promise<CartItem[]>

  addCartItems(items: CartItemAddInput[]): Promise<CartItemEditResponse[]>

  updateCartItems(items: CartItemUpdateInput[]): Promise<CartItemEditResponse[]>

  removeCartItems(cartItemIds: string[]): Promise<CartItemEditResponse[]>

  checkoutCart(): Promise<boolean>
}

interface CartItemAddInput {
  productId: string
  title: string
  price: number
  quantity: number
}

interface CartItemUpdateInput {
  id: string
  quantity: number
}

interface CartItemEditResponse extends CartItem {
  product: Pick<Product, 'id' | 'stock'>
}

interface RawProduct extends RawEntity<Product> {}

interface RawCartItem extends RawEntity<CartItem> {}

interface RawCartItemEditResponse extends RawEntity<CartItemEditResponse> {}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace APIContainer {
  export function newInstance(): APIContainer {
    return newRawInstance()
  }

  export function newRawInstance() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const client = APIClient.newInstance()

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const getProduct: APIContainer['getProduct'] = async id => {
      const response = await client.get<RawProduct[]>('products', {
        params: { ids: [id] },
      })
      if (response.data.length === 0) return
      return toEntities(response.data)[0]
    }

    const getProducts: APIContainer['getProducts'] = async ids => {
      const response = await client.get<RawProduct[]>('products', {
        params: { ids },
      })
      return toEntities(response.data)
    }

    const getCartItem: APIContainer['getCartItem'] = async id => {
      const response = await client.get<RawCartItem[]>('cartItems', {
        isAuth: true,
        params: { ids: [id] },
      })
      if (response.data.length === 0) return
      return toEntities(response.data)[0]
    }

    const getCartItems: APIContainer['getCartItems'] = async ids => {
      const response = await client.get<RawCartItem[]>('cartItems', {
        isAuth: true,
        params: { ids },
      })
      return toEntities(response.data)
    }

    const addCartItems: APIContainer['addCartItems'] = async items => {
      const response = await client.post<RawCartItemEditResponse[]>('cartItems', items, { isAuth: true })
      return toEntities(response.data)
    }

    const updateCartItems: APIContainer['updateCartItems'] = async items => {
      const response = await client.put<RawCartItemEditResponse[]>('cartItems', items, { isAuth: true })
      return toEntities(response.data)
    }

    const removeCartItems: APIContainer['removeCartItems'] = async cartItemIds => {
      const response = await client.delete<RawCartItemEditResponse[]>('cartItems', {
        isAuth: true,
        params: { ids: cartItemIds },
      })
      return toEntities(response.data)
    }

    const checkoutCart: APIContainer['checkoutCart'] = async () => {
      const response = await client.put<boolean>('cartItems/checkout', undefined, { isAuth: true })
      return response.data
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function toEntity<T extends RawEntity | undefined | null>(rawEntity: T): ToEntity<T> {
      if (!rawEntity) return undefined as ToEntity<T>

      const { createdAt, updatedAt, ...others } = rawEntity as RawEntity
      return {
        ...others,
        createdAt: dayjs(createdAt),
        updatedAt: dayjs(updatedAt),
      } as ToEntity<T>
    }

    function toEntities<T extends RawEntity>(rawEntities: T[]): ToEntity<T>[] {
      return rawEntities.map(rawEntity => toEntity(rawEntity)!)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      getProduct,
      getProducts,
      getCartItem,
      getCartItems,
      addCartItems,
      updateCartItems,
      removeCartItems,
      checkoutCart,
      client,
    }
  }
}

//========================================================================
//
//  Dependency Injection
//
//========================================================================

let instance: APIContainer

function provideAPI(api: APIContainer): void {
  instance = api
}

function injectAPI(): APIContainer {
  if (!instance) {
    throw new Error(`'APIContainer' is not provided`)
  }
  return instance
}

//========================================================================
//
//  Exports
//
//========================================================================

export {
  APIContainer,
  CartItemAddInput,
  CartItemEditResponse,
  CartItemUpdateInput,
  RawCartItem,
  RawCartItemEditResponse,
  RawProduct,
  injectAPI,
  provideAPI,
}
