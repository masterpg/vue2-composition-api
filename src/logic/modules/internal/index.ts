import { InjectionKey, WritableComputedRef, computed, inject, reactive } from '@vue/composition-api'
import { StoreContainerKey } from '@/logic/store'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface InternalLogic {
  helper: {
    generateId: () => string
  }
  auth: {
    isSignedIn: WritableComputedRef<boolean>
    validateSignedIn(): void
  }
}
type HelperLogic = InternalLogic['helper']
type AuthLogic = InternalLogic['auth']

//========================================================================
//
//  Implementation
//
//========================================================================

function createHelperLogic(): HelperLogic {
  const generateId: HelperLogic['generateId'] = () => {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let autoId = ''
    for (let i = 0; i < 20; i++) {
      autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
    }
    return autoId
  }

  return {
    generateId,
  }
}

function createAuthLogic(): AuthLogic {
  const state = reactive({
    isSignedIn: false,
  })

  const store = inject(StoreContainerKey)!

  const isSignedIn = computed<boolean>({
    get: () => state.isSignedIn,
    set: value => (state.isSignedIn = value),
  })

  const validateSignedIn: AuthLogic['validateSignedIn'] = () => {
    if (!state.isSignedIn) {
      throw new Error(`The application is not yet signed in.`)
    }
  }

  return {
    isSignedIn: isSignedIn,
    validateSignedIn,
  }
}

function createInternalLogic(): InternalLogic {
  return {
    helper: createHelperLogic(),
    auth: createAuthLogic(),
  }
}

const InternalLogicKey: InjectionKey<InternalLogic> = Symbol('InternalLogic')

//========================================================================
//
//  Export
//
//========================================================================

export { InternalLogicKey, createInternalLogic }
