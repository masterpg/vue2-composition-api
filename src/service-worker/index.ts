import { InjectionKey, inject, provide, reactive } from '@vue/composition-api'
import { useI18n } from '@/i18n'
const path = require('path')

//========================================================================
//
//  Interfaces
//
//========================================================================

interface ServiceWorkerManager {
  /**
   * ServiceWorkerの状態が変化した際のリスナを登録します。
   * @param listener
   */
  addStateChangeListener(listener: StateChangeLister): void
}

type StateChangeLister = (info: ServiceWorkerStateChangeInfo) => void

enum ServiceWorkerChangeState {
  ready = 'ready',
  registered = 'registered',
  cached = 'cached',
  updatefound = 'updatefound',
  updated = 'updated',
  offline = 'offline',
  error = 'error',
}

interface ServiceWorkerStateChangeInfo {
  state: ServiceWorkerChangeState
  message: string
}

//========================================================================
//
//  Implementation
//
//========================================================================

const emptyInstance: ServiceWorkerManager = {
  addStateChangeListener(listener: StateChangeLister) {},
}

function createServiceWorker(): ServiceWorkerManager {
  if (!('serviceWorker' in navigator)) return emptyInstance

  const execute = process.env.NODE_ENV === 'production'
  if (!execute) return emptyInstance

  //----------------------------------------------------------------------
  //
  //  Variables
  //
  //----------------------------------------------------------------------

  const state = reactive({
    stateChangeListeners: [] as StateChangeLister[],
  })

  const { t } = useI18n()

  //----------------------------------------------------------------------
  //
  //  Initialization
  //
  //----------------------------------------------------------------------

  const register = require('register-service-worker').register
  register(path.join(process.env.BASE_URL ?? '', 'service-worker.js'), {
    ready: () => {
      dispatchToListeners(ServiceWorkerChangeState.ready, String(t('serviceWorker.ready')))
    },
    registered: () => {
      dispatchToListeners(ServiceWorkerChangeState.registered, String(t('serviceWorker.registered')))
    },
    cached: () => {
      dispatchToListeners(ServiceWorkerChangeState.cached, String(t('serviceWorker.cached')))
    },
    updatefound: () => {
      dispatchToListeners(ServiceWorkerChangeState.updatefound, String(t('serviceWorker.updatefound')))
    },
    updated: () => {
      dispatchToListeners(ServiceWorkerChangeState.updated, String(t('serviceWorker.updated')))
    },
    offline: () => {
      dispatchToListeners(ServiceWorkerChangeState.offline, String(t('serviceWorker.offline')))
    },
    error: (err: Error) => {
      dispatchToListeners(ServiceWorkerChangeState.error, String(t('serviceWorker.error', { err })))
    },
  })

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  const addStateChangeListener: ServiceWorkerManager['addStateChangeListener'] = listener => {
    state.stateChangeListeners.push(listener)
  }

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  /**
   * 登録されているサービスワーカーのイベントリスナーにイベントをディスパッチします。
   * @param changeState
   * @param message
   */
  function dispatchToListeners(changeState: ServiceWorkerChangeState, message: string): void {
    for (const listener of state.stateChangeListeners) {
      listener({ state: changeState, message })
    }
  }

  //----------------------------------------------------------------------
  //
  //  Result
  //
  //----------------------------------------------------------------------

  return {
    addStateChangeListener,
  }
}

const ServiceWorkerKey: InjectionKey<ServiceWorkerManager> = Symbol('ServiceWorkerManager')

function provideServiceWorker(): void {
  provide(ServiceWorkerKey, createServiceWorker())
}

function injectServiceWorker(): ServiceWorkerManager {
  validateServiceWorkerProvided()
  return inject(ServiceWorkerKey)!
}

function validateServiceWorkerProvided(): void {
  if (!inject(ServiceWorkerKey)) {
    throw new Error(`${ServiceWorkerKey.description} is not provided`)
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { ServiceWorkerKey, provideServiceWorker, createServiceWorker, injectServiceWorker, validateServiceWorkerProvided, ServiceWorkerChangeState }