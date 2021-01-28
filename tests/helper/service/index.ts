import { Entity, ServiceContainer } from '@/service'
import { InternalService } from '@/service/modules/internal'
import { TestAPIContainer } from './api'
import { TestStoreContainer } from './store'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface TestServiceContainer extends ServiceContainer {}

interface TestServiceDependency {
  api: TestAPIContainer
  store: TestStoreContainer
  internal: InternalService
}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace TestServiceContainer {
  export function newInstance(): TestServiceContainer & { readonly dependency: TestServiceDependency } {
    const api = TestAPIContainer.newInstance()
    const store = TestStoreContainer.newInstance()
    const internal = InternalService.newInstance()
    const dependency = { api, store, internal }

    const base = ServiceContainer.newRawInstance(dependency)

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

export { TestServiceContainer, expectNotToBeCopyEntity }
export * from './api'
export * from './store'
