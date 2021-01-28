import { WritableComputedRef, computed, reactive } from '@vue/composition-api'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface InternalService {
  helper: InternalHelperService
  auth: InternalAuthService
}

interface InternalHelperService {}

interface InternalAuthService {
  isSignedIn: WritableComputedRef<boolean>
  validateSignedIn(): void
}

//========================================================================
//
//  Implementation
//
//========================================================================

//--------------------------------------------------
//  InternalHelperService
//--------------------------------------------------

namespace InternalHelperService {
  export function newInstance(): InternalHelperService {
    return {}
  }
}

//--------------------------------------------------
//  InternalAuthService
//--------------------------------------------------

namespace InternalAuthService {
  export function newInstance(): InternalAuthService {
    const state = reactive({
      isSignedIn: false,
    })

    const isSignedIn = computed<boolean>({
      get: () => state.isSignedIn,
      set: value => (state.isSignedIn = value),
    })

    const validateSignedIn: InternalAuthService['validateSignedIn'] = () => {
      if (!state.isSignedIn) {
        throw new Error(`The application is not yet signed in.`)
      }
    }

    return {
      isSignedIn,
      validateSignedIn,
    }
  }
}

//--------------------------------------------------
//  InternalService
//--------------------------------------------------

namespace InternalService {
  export function newInstance(): InternalService {
    return newRawInstance()
  }

  export function newRawInstance(options?: { helper?: InternalHelperService; auth?: InternalAuthService }) {
    const helper = options?.helper ?? InternalHelperService.newInstance()
    const auth = options?.auth ?? InternalAuthService.newInstance()

    return {
      helper,
      auth,
    }
  }
}

//========================================================================
//
//  Dependency Injection
//
//========================================================================

let instance: InternalService

function provideInternalService(internal: InternalService): void {
  instance = internal
}

function injectInternalService(): InternalService {
  if (!instance) {
    throw new Error(`'InternalService' is not provided`)
  }
  return instance
}

//========================================================================
//
//  Export
//
//========================================================================

export { InternalAuthService, InternalHelperService, InternalService, injectInternalService, provideInternalService }
