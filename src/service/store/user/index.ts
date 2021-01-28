import { DeepReadonly } from 'web-base-lib'
import { User } from '@/service/base'
import dayjs from 'dayjs'
import { reactive } from '@vue/composition-api'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface UserStore {
  value: DeepReadonly<User>
  set(user: User): DeepReadonly<User>
  clear(): void
}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace UserStore {
  export function newInstance(): UserStore {
    return newRawInstance()
  }

  export function newRawInstance() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const state = reactive({
      value: createEmptyState(),
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const set: UserStore['set'] = user => {
      return User.populate(user, state.value)
    }

    const clear: UserStore['clear'] = () => {
      set(createEmptyState())
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      value: state.value,
      set,
      clear,
    }
  }

  function createEmptyState(): User {
    return {
      id: '',
      email: '',
      displayName: '',
      createdAt: dayjs(0),
      updatedAt: dayjs(0),
    }
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { UserStore }
