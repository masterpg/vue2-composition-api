import { APIContainer } from '@/service/api'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface TestAPIContainer extends APIContainer {
  putTestData(testData: any): Promise<void>
}

type APIContainerImpl = ReturnType<typeof APIContainer['newRawInstance']>

//========================================================================
//
//  Implementation
//
//========================================================================

namespace TestAPIContainer {
  export function newInstance(): TestAPIContainer {
    const api = APIContainer.newRawInstance()
    return mix(api)
  }

  export function mix<T extends APIContainerImpl>(api: T): TestAPIContainer & T {
    const putTestData: TestAPIContainer['putTestData'] = async testData => {
      await api.client.put('testData', testData)
    }

    return {
      ...api,
      putTestData,
    }
  }
}

//========================================================================
//
//  Exports
//
//========================================================================

export { TestAPIContainer }
