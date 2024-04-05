import {MDIObservable} from 'src/components/MDITabs'

const defaultObservable = (): MDIObservable<any> => ({
  onUpdate: [],
  onClose: []
})

/**
 * Local storage for callbacks (because redux doesn't allow store unserializable objects)
 */
const localCallbacksStore: Map<string, MDIObservable<any>> = new Map()

export function register(key: string, observable: MDIObservable<any>) {
  const callbacks: MDIObservable<any> = localCallbacksStore.get(key) ?? defaultObservable()
  callbacks.onUpdate = [...callbacks.onUpdate, ...observable.onUpdate]
  callbacks.onClose = [...callbacks.onClose, ...observable.onClose]
  localCallbacksStore.set(key, callbacks)
}

export function unregister(key: string) {
  localCallbacksStore.delete(key)
}

export function changeKey(key: string, newKey: string) {
  if (newKey === key)
    return

  const callbacks: MDIObservable<any> = localCallbacksStore.get(key) ?? defaultObservable()
  localCallbacksStore.delete(key)
  localCallbacksStore.set(newKey, callbacks)
}

export function onUpdate(key: string, data: any) {
  const callbacks: MDIObservable<any> = localCallbacksStore.get(key) ?? defaultObservable()
  callbacks.onUpdate.forEach(updCb => updCb(data))
}

export function onClose(key: string, data: any, remove: boolean) {
  const callbacks: MDIObservable<any> = localCallbacksStore.get(key) ?? defaultObservable()
  callbacks.onClose.forEach(updCb => updCb(data, remove))
}

export function reset() {
  localCallbacksStore.clear()
}