import { DeepReadonly } from 'web-base-lib'
import { Product } from '@/logic/types'
import { StatePartial } from '@/logic/store/base'
import dayjs from 'dayjs'
import { reactive } from '@vue/composition-api'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface ProductStore {
  readonly all: DeepReadonly<Product>[]

  getById(productId: string): Product | undefined

  sgetById(productId: string): Product

  setAll(products: Product[]): void

  set(product: StatePartial<Product>): Product

  add(product: Product): Product

  decrementStock(productId: string): void

  incrementStock(productId: string): void

  clone(source: Product): Product
}

//========================================================================
//
//  Implementation
//
//========================================================================

function createProductStore(): ProductStore {
  //----------------------------------------------------------------------
  //
  //  Variables
  //
  //----------------------------------------------------------------------

  const state = reactive({
    all: [] as Product[],
  })

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  const getById: ProductStore['getById'] = productId => {
    const stateItem = getStateProductById(productId)
    return stateItem ? clone(stateItem) : undefined
  }

  const sgetById: ProductStore['sgetById'] = productId => {
    const result = getById(productId)
    if (!result) {
      throw new Error(`The specified Product was not found: { id: "${productId}" }`)
    }
    return result
  }

  const setAll: ProductStore['setAll'] = products => {
    state.all.splice(0)
    for (const product of products) {
      state.all.push(clone(product))
    }
  }

  const set: ProductStore['set'] = product => {
    const stateItem = getStateProductById(product.id)
    if (!stateItem) {
      throw new Error(`The specified Product was not found: '${product.id}'`)
    }

    populate(product, stateItem)
    return clone(stateItem)
  }

  const add: ProductStore['add'] = product => {
    const stateItem = clone(product)
    state.all.push(stateItem)
    return clone(stateItem)
  }

  const decrementStock: ProductStore['decrementStock'] = productId => {
    const product = state.all.find(item => item.id === productId)
    if (!product) {
      throw new Error(`The specified product was not found: '${productId}'`)
    }
    product.stock--
  }

  const incrementStock: ProductStore['incrementStock'] = productId => {
    const product = state.all.find(item => item.id === productId)
    if (!product) {
      throw new Error(`The specified product was not found: '${productId}'`)
    }
    product.stock++
  }

  const clone: ProductStore['clone'] = source => {
    return populate(source, {})
  }

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  function getStateProductById(productId: string): Product | undefined {
    return state.all.find(item => item.id === productId)
  }

  function populate(from: Partial<Product>, to: Partial<Product>): Product {
    if (typeof from.id === 'string') to.id = from.id
    if (typeof from.title === 'string') to.title = from.title
    if (typeof from.price === 'number') to.price = from.price
    if (typeof from.stock === 'number') to.stock = from.stock
    if (from.createdAt) to.createdAt = dayjs(from.createdAt)
    if (from.updatedAt) to.updatedAt = dayjs(from.updatedAt)
    return to as Product
  }

  //----------------------------------------------------------------------
  //
  //  Result
  //
  //----------------------------------------------------------------------

  return {
    all: state.all,
    getById,
    sgetById,
    setAll,
    set,
    add,
    decrementStock,
    incrementStock,
    clone,
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { ProductStore, createProductStore }
