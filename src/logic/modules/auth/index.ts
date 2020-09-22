import { ComputedRef } from '@vue/composition-api'
import { DeepReadonly } from 'web-base-lib'
import { TestData } from '@/logic/test-data'
import { User } from '@/logic/types'
import { injectInternalLogic } from '@/logic/modules/internal'
import { injectStore } from '@/logic/store'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface AuthLogic {
  readonly user: DeepReadonly<User>

  readonly isSignedIn: ComputedRef<boolean>

  signIn(): Promise<void>

  signOut(): Promise<void>

  validateSignedIn(): void
}

//========================================================================
//
//  Implementation
//
//========================================================================

function createAuthLogic(): AuthLogic {
  //----------------------------------------------------------------------
  //
  //  Variables
  //
  //----------------------------------------------------------------------

  const internal = injectInternalLogic()
  const store = injectStore()

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  const signIn: AuthLogic['signIn'] = async () => {
    store.user.set(TestData.user)
    internal.auth.isSignedIn.value = true

    store.product.setAll(TestData.products)
  }

  const signOut: AuthLogic['signOut'] = async () => {
    store.user.clear()
    internal.auth.isSignedIn.value = false

    store.product.setAll(TestData.products)
    store.cart.setAll([])
  }

  const validateSignedIn = internal.auth.validateSignedIn

  //----------------------------------------------------------------------
  //
  //  Result
  //
  //----------------------------------------------------------------------

  return {
    user: store.user.value,
    isSignedIn: internal.auth.isSignedIn,
    signIn,
    signOut,
    validateSignedIn,
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { AuthLogic, createAuthLogic }
