import { DeepReadonly } from 'web-base-lib'
import { User } from '@/logic/types'
import dayjs from 'dayjs'
import { reactive } from '@vue/composition-api'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface UserStore {
  value: DeepReadonly<User>
  set(user: User): void
  clear(): void
  clone(source: User): User
}

//========================================================================
//
//  Implementation
//
//========================================================================

function createEmptyState(): User {
  return {
    id: '',
    email: '',
    displayName: '',
    createdAt: dayjs(0),
    updatedAt: dayjs(0),
  }
}

function createUserStore(): UserStore {
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
    populate(user, state.value)
  }

  const clear: UserStore['clear'] = () => {
    set(createEmptyState())
  }

  const clone: UserStore['clone'] = (source: User) => {
    return populate(source, {})
  }

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  function populate(from: Partial<User>, to: Partial<User>): User {
    if (typeof from.id === 'string') to.id = from.id
    if (typeof from.email === 'string') to.email = from.email
    if (typeof from.displayName === 'string') to.displayName = from.displayName
    if (from.createdAt) to.createdAt = dayjs(from.createdAt)
    if (from.updatedAt) to.updatedAt = dayjs(from.updatedAt)
    return to as User
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
    clone,
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { UserStore, createUserStore }
