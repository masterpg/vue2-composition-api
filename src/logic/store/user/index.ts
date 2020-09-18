import { computed, reactive } from '@vue/composition-api'
import { DeepReadonly } from 'web-base-lib'
import { User } from '@/logic/types'
import dayjs from 'dayjs'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface UserStore extends DeepReadonly<User> {
  set(user: User): void
  clear(): void
  clone(source: User): User
}

interface UserState {
  user: User
}

//========================================================================
//
//  Implementation
//
//========================================================================

// namespace UserStore {
//   export function clone(source: User): User {
//     return populate(source, {})
//   }
//
//   export function populate(from: Partial<User>, to: Partial<User>): User {
//     if (typeof from.id === 'string') to.id = from.id
//     if (typeof from.email === 'string') to.email = from.email
//     if (typeof from.displayName === 'string') to.displayName = from.displayName
//     if (from.createdAt) to.createdAt = dayjs(from.createdAt)
//     if (from.updatedAt) to.updatedAt = dayjs(from.updatedAt)
//     return to as User
//   }
// }

function createUserStore(): UserStore {
  const createEmptyState = () => {
    return {
      id: '',
      email: '',
      displayName: '',
      createdAt: dayjs(0),
      updatedAt: dayjs(0),
    } as User
  }

  const state = reactive<UserState>({
    user: createEmptyState(),
  })

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  const set: UserStore['set'] = user => {
    populate(user, state.user)
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
    id: computed(() => state.user.id) as any,
    email: computed(() => state.user.email) as any,
    displayName: computed(() => state.user.displayName) as any,
    createdAt: computed(() => state.user.createdAt) as any,
    updatedAt: computed(() => state.user.updatedAt) as any,
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
