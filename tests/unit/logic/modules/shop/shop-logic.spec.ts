import { CartItem, Product } from '@/logic'
import { CartStore } from '@/logic/store/cart'
import { InternalAuthLogic } from '@/logic/modules/internal'
import { ProductStore } from '@/logic/store/product'
import { ShopLogic } from '@/logic/modules/shop'
import dayjs from 'dayjs'
import { provideLogic } from '../../../../helpers/logic'

//========================================================================
//
//  Test data
//
//========================================================================

export const PRODUCTS: Product[] = [
  { id: 'product1', title: 'iPad 4 Mini', price: 39700, stock: 1, createdAt: dayjs('2020-01-01'), updatedAt: dayjs('2020-01-02') },
  { id: 'product2', title: 'Fire HD 8 Tablet', price: 8980, stock: 5, createdAt: dayjs('2020-01-01'), updatedAt: dayjs('2020-01-02') },
  { id: 'product3', title: 'MediaPad 10', price: 26400, stock: 10, createdAt: dayjs('2020-01-01'), updatedAt: dayjs('2020-01-02') },
  { id: 'product4', title: 'Surface Go', price: 54290, stock: 0, createdAt: dayjs('2020-01-01'), updatedAt: dayjs('2020-01-02') },
]

export const CART_ITEMS: CartItem[] = [
  {
    id: 'cartItem1',
    uid: 'taro.yamada',
    productId: 'product1',
    title: 'iPad 4 Mini',
    price: 39700,
    quantity: 1,
    createdAt: dayjs('2020-01-01'),
    updatedAt: dayjs('2020-01-02'),
  },
  {
    id: 'cartItem2',
    uid: 'taro.yamada',
    productId: 'product2',
    title: 'Fire HD 8 Tablet',
    price: 8980,
    quantity: 1,
    createdAt: dayjs('2020-01-01'),
    updatedAt: dayjs('2020-01-02'),
  },
]

//========================================================================
//
//  Tests
//
//========================================================================

describe('ShopLogic', () => {
  beforeEach(async () => {})

  it('fetchProducts', async () => {
    const { logic } = provideLogic(({ store }) => {
      td.replace<ProductStore, 'all'>(store.product, 'all', [PRODUCTS[0]])
    })

    // テスト対象を実行
    const actual = await logic.shop.fetchProducts()

    expect(actual).toEqual([PRODUCTS[0]])
  })

  it('fetchCartItems', async () => {
    const { logic, internal } = provideLogic(({ internal, store }) => {
      td.replace<InternalAuthLogic, 'validateSignedIn'>(internal.auth, 'validateSignedIn')
      td.replace<CartStore, 'all'>(store.cart, 'all', CART_ITEMS)
    })

    // テスト対象を実行
    const actual = await logic.shop.fetchCartItems()

    expect(actual).toEqual(CART_ITEMS)

    // logic.auth.validateSignedInの呼び出しを検証
    const exp = td.explain(internal.auth.validateSignedIn)
    expect(exp.calls.length).toBe(1) // 1回呼び出されるはず
    expect(exp.calls[0].args[0]).toBeUndefined() // 1回目の呼び出しが引数なしなはず
  })
})
