import { CartItem, Product, User } from '@/logic/types'
import dayjs from 'dayjs'

namespace TestData {
  export const user: User = {
    id: 'taro.yamada',
    email: 'taro.yamada@example.com',
    displayName: '山田 太郎',
    createdAt: dayjs('2020-01-01'),
    updatedAt: dayjs('2020-01-01'),
  }

  export const products: Product[] = [
    { id: 'product1', title: 'iPad 4 Mini', price: 39700, stock: 1, createdAt: dayjs('2020-01-01'), updatedAt: dayjs('2020-01-02') },
    { id: 'product2', title: 'Fire HD 8 Tablet', price: 8980, stock: 5, createdAt: dayjs('2020-01-01'), updatedAt: dayjs('2020-01-02') },
    { id: 'product3', title: 'MediaPad 10', price: 26400, stock: 10, createdAt: dayjs('2020-01-01'), updatedAt: dayjs('2020-01-02') },
    { id: 'product4', title: 'Surface Go', price: 54290, stock: 0, createdAt: dayjs('2020-01-01'), updatedAt: dayjs('2020-01-02') },
  ]

  export const cartItems: CartItem[] = [
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
}

export { TestData }
