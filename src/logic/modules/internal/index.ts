import { InjectionKey, WritableComputedRef, computed, inject, provide, reactive } from '@vue/composition-api'
import { injectStore } from '@/logic/store'

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

//--------------------------------------------------
//  HelperLogic
//--------------------------------------------------

function createInternalHelperLogic(): HelperLogic {
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

//--------------------------------------------------
//  AuthLogic
//--------------------------------------------------

function createInternalAuthLogic(): AuthLogic {
  const store = injectStore()

  const state = reactive({
    isSignedIn: false,
  })

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
    isSignedIn,
    validateSignedIn,
  }
}

//--------------------------------------------------
//  Others
//--------------------------------------------------

const InternalLogicKey: InjectionKey<InternalLogic> = Symbol('InternalLogic')

function createInternalLogic(): InternalLogic {
  return {
    helper: createInternalHelperLogic(),
    auth: createInternalAuthLogic(),
  }
}

function provideInternalLogic(): void {
  provide(InternalLogicKey, createInternalLogic())
}

function injectInternalLogic(): InternalLogic {
  validateInternalLogicProvided()
  return inject(InternalLogicKey)!
}

function validateInternalLogicProvided(): void {
  const result = inject(InternalLogicKey)
  if (!result) {
    throw new Error(`${InternalLogicKey} is not provided`)
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export {
  InternalLogic,
  InternalLogicKey,
  provideInternalLogic,
  injectInternalLogic,
  validateInternalLogicProvided,
  createInternalAuthLogic,
  createInternalHelperLogic,
}
