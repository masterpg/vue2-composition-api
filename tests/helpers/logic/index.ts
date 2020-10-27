import { Entity, LogicContainer } from '@/logic'
import { InternalLogic } from '@/logic/modules/internal'
import { StoreContainer } from '@/logic/store'
import { TestAPIContainer } from './api'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface TestLogicContainer extends LogicContainer {}

interface TestLogicDependency {
  api: TestAPIContainer
  store: StoreContainer
  internal: InternalLogic
}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace TestLogicContainer {
  export function newInstance(): TestLogicContainer & { readonly dependency: TestLogicDependency } {
    const api = TestAPIContainer.newInstance()
    const store = StoreContainer.newInstance()
    const internal = InternalLogic.newInstance()
    const dependency = { api, store, internal }

    const base = LogicContainer.newRawInstance(dependency)

    return {
      ...base,
      dependency,
    }
  }
}

/**
 * 指定されたアイテムがコピーであることを検証します。
 * @param actual
 * @param expected
 */
function expectNotToBeCopyEntity<T extends Entity>(actual: T | T[], expected: T | T[]): void {
  const actualItems = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  const expectedItems = Array.isArray(expected) ? (expected as T[]) : [expected as T]

  for (let i = 0; i < actualItems.length; i++) {
    const actualItemItem = actualItems[i]
    const expectedItem = expectedItems[i]
    expect(actualItemItem.id).toBe(expectedItem.id)
    expect(actualItemItem).not.toBe(expectedItem)
  }
}

//========================================================================
//
//  Exports
//
//========================================================================

export { TestLogicContainer, expectNotToBeCopyEntity }
export * from './api'
