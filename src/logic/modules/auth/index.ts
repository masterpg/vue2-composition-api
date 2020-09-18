import { computed, inject } from '@vue/composition-api'
import { DeepReadonly } from 'web-base-lib'
import { InternalLogicKey } from '@/logic/modules/internal'
import { StoreContainerKey } from '@/logic/store'
import { TestData } from '@/logic/test-data'
import { User } from '@/logic/types'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface AuthLogic {
  readonly user: DeepReadonly<User>

  readonly isSignedIn: boolean

  signIn(): Promise<void>

  signOut(): Promise<void>
}

//========================================================================
//
//  Implementation
//
//========================================================================

function createAuthLogic(): AuthLogic {
  const internal = inject(InternalLogicKey)!
  const store = inject(StoreContainerKey)!

  //----------------------------------------------------------------------
  //
  //  Properties
  //
  //----------------------------------------------------------------------

  const isSignIn = computed(() => internal.auth.isSignedIn.value)

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

  //----------------------------------------------------------------------
  //
  //  Result
  //
  //----------------------------------------------------------------------

  return {
    user: store.user,
    isSignedIn: isSignIn as any,
    signIn,
    signOut,
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { AuthLogic, createAuthLogic }
