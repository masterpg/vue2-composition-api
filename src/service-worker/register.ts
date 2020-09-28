// Register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the "N+1" visit to a page, since previously
// cached resources are updated in the background.

import { sleep } from 'web-base-lib'

//========================================================================
//
//  Interfaces
//
//========================================================================

type ServiceWorkerChangeState = 'ready' | 'registered' | 'cached' | 'updatefound' | 'updated' | 'offline' | 'error'

type HookFunc = (state: ServiceWorkerChangeState) => void
type HookRegistrationFunc = (state: ServiceWorkerChangeState, registration: ServiceWorkerRegistration) => void
type HookErrorFunc = (state: 'error', error: Error) => void

interface Hooks {
  ready?: HookRegistrationFunc
  registered?: HookRegistrationFunc
  cached?: HookRegistrationFunc
  updatefound?: HookRegistrationFunc
  updated?: HookRegistrationFunc
  offline?: HookFunc
  error?: HookErrorFunc
  registrationOptions?: RegistrationOptions
}

type EmitFunc = (state: ServiceWorkerChangeState, registration_or_error?: ServiceWorkerRegistration | Error) => void

//========================================================================
//
//  Implementation
//
//========================================================================

const isLocalhost = () =>
  Boolean(
    window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  )

const waitWindowLoad = new Promise(resolve => {
  window.addEventListener('load', resolve)
})

function register(swUrl: string, hooks: Hooks = {}): void {
  const { registrationOptions = {} } = hooks
  delete hooks.registrationOptions

  const emit: EmitFunc = (state, registration_or_error) => {
    switch (state) {
      case 'ready':
      case 'registered':
      case 'cached':
      case 'updatefound':
      case 'updated': {
        const hookFunc = hooks[state]
        hookFunc && hookFunc(state, registration_or_error as ServiceWorkerRegistration)
        break
      }
      case 'offline': {
        const hookFunc = hooks[state]
        hookFunc && hookFunc(state!)
        break
      }
      case 'error': {
        const hookFunc = hooks[state]
        hookFunc && hookFunc(state, registration_or_error as Error)
        break
      }
    }
  }

  if ('serviceWorker' in navigator) {
    waitWindowLoad.then(async () => {
      if (isLocalhost()) {
        // This is running on localhost. Lets check if a service worker still exists or not.
        await checkValidServiceWorker(swUrl, emit, registrationOptions)
        const registration = await navigator.serviceWorker.ready.then()
        emit('ready', registration)
      } else {
        // Is not local host. Just register service worker
        await registerValidSW(swUrl, emit, registrationOptions)
        const registration = await navigator.serviceWorker.ready.then()
        emit('ready', registration)
      }
    })
  }
}

function handleError(emit: EmitFunc, error: Error) {
  if (!navigator.onLine) {
    emit('offline')
  }
  emit('error', error)
}

async function registerValidSW(swUrl: string, emit: EmitFunc, registrationOptions: RegistrationOptions) {
  let registration!: ServiceWorkerRegistration
  try {
    registration = await navigator.serviceWorker.register(swUrl, registrationOptions)
  } catch (err) {
    handleError(emit, err)
  }

  emit('registered', registration)

  if (registration.waiting) {
    emit('updated', registration)
    return
  }

  registration.onupdatefound = () => {
    emit('updatefound', registration)
    const installingWorker = registration.installing
    if (!installingWorker) {
      handleError(emit, new Error('Service worker during installation was not found.'))
      return
    }

    installingWorker.onstatechange = () => {
      if (installingWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // At this point, the old content will have been purged and
          // the fresh content will have been added to the cache.
          // It's the perfect time to display a "New content is
          // available; please refresh." message in your web app.
          sleep(1000).then(() => {
            // TODO
            //  このイベントを受け取った側で以下のコードが実行されると、リロードしてもServiceWorker
            //  の状態が`skipWaiting`から先に進まず更新が完了しなくなってしまう。
            //  この対応として一定時間スリープしてからイベントを発火すれば問題は発生しなくなった。
            //  ```
            //    Notify.create({
            //      …
            //      actions: { … }
            //    })
            //  ```
            emit('updated', registration)
          })
        } else {
          // At this point, everything has been precached.
          // It's the perfect time to display a
          // "Content is cached for offline use." message.
          emit('cached', registration)
        }
      }
    }
  }
}

async function checkValidServiceWorker(swUrl: string, emit: EmitFunc, registrationOptions: RegistrationOptions): Promise<void> {
  try {
    const response = await fetch(swUrl)
    // Ensure service worker exists, and that we really are getting a JS file.
    if (response.status === 404) {
      // No service worker found.
      emit('error', new Error(`Service worker not found at ${swUrl}`))
      await unregister()
    } else if (response.headers.get('content-type')!.indexOf('javascript') === -1) {
      emit('error', new Error(`Expected ${swUrl} to have javascript content-type, but received ${response.headers.get('content-type')}`))
      await unregister()
    } else {
      // Service worker found. Proceed as normal.
      await registerValidSW(swUrl, emit, registrationOptions)
    }
  } catch (err) {
    handleError(emit, err)
  }
}

async function unregister() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready.then()
    await registration.unregister()
  }
}

//========================================================================
//
//  Exports
//
//========================================================================

export { register, unregister, ServiceWorkerChangeState }
