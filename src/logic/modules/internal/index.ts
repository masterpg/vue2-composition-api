import { WritableComputedRef, computed, reactive } from '@vue/composition-api'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface InternalLogic {
  helper: InternalHelperLogic
  auth: InternalAuthLogic
}

interface InternalHelperLogic {}

interface InternalAuthLogic {
  isSignedIn: WritableComputedRef<boolean>
  validateSignedIn(): void
}

//========================================================================
//
//  Implementation
//
//========================================================================

//--------------------------------------------------
//  InternalHelperLogic
//--------------------------------------------------

namespace InternalHelperLogic {
  export function newInstance(): InternalHelperLogic {
    return {}
  }
}

//--------------------------------------------------
//  InternalAuthLogic
//--------------------------------------------------

namespace InternalAuthLogic {
  export function newInstance(): InternalAuthLogic {
    const state = reactive({
      isSignedIn: false,
    })

    const isSignedIn = computed<boolean>({
      get: () => state.isSignedIn,
      set: value => (state.isSignedIn = value),
    })

    const validateSignedIn: InternalAuthLogic['validateSignedIn'] = () => {
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
//  InternalLogic
//--------------------------------------------------

namespace InternalLogic {
  export function newInstance(): InternalLogic {
    return newRawInstance()
  }

  export function newRawInstance(options?: { helper?: InternalHelperLogic; auth?: InternalAuthLogic }) {
    const helper = options?.helper ?? InternalHelperLogic.newInstance()
    const auth = options?.auth ?? InternalAuthLogic.newInstance()

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

let instance: InternalLogic

function provideInternalLogic(internal: InternalLogic): void {
  instance = internal
}

function injectInternalLogic(): InternalLogic {
  if (!instance) {
    throw new Error(`'InternalLogic' is not provided`)
  }
  return instance
}

//========================================================================
//
//  Export
//
//========================================================================

export { InternalAuthLogic, InternalHelperLogic, InternalLogic, injectInternalLogic, provideInternalLogic }
