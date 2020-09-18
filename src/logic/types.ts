import { Dayjs } from 'dayjs'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface Entity {
  id: string
}

interface TimestampEntity {
  id: string
  createdAt: Dayjs
  updatedAt: Dayjs
}

//========================================================================
//
//  Interfaces
//
//========================================================================

interface User extends TimestampEntity {
  email: string
  displayName: string
}

interface Product extends TimestampEntity {
  title: string
  price: number
  stock: number
}

interface CartItem extends TimestampEntity {
  uid: string
  productId: string
  title: string
  price: number
  quantity: number
}

enum CheckoutStatus {
  None = 'none',
  Failed = 'failed',
  Successful = 'successful',
}

//========================================================================
//
//  Export
//
//========================================================================

export { User, Product, CartItem, CheckoutStatus }
