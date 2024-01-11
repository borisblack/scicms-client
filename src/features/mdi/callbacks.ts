import {MDIObservable} from '../../components/MDITabs'

const defaultObservable: MDIObservable<any> = {
    onUpdate: [],
    onClose: []
}

/**
 * Local storage for callbacks (because redux doesn't allow store unserializable objects)
 */
const localCallbacksStore: Record<string, MDIObservable<any>> = {}

export function register(key: string, observable: MDIObservable<any>) {
    const callbacks: MDIObservable<any> = localCallbacksStore[key] ?? defaultObservable
    callbacks.onUpdate = [...callbacks.onUpdate, ...observable.onUpdate]
    callbacks.onClose = [...callbacks.onClose, ...observable.onClose]
    localCallbacksStore[key] = callbacks
}

export function changeKey(key: string, newKey: string) {
    if (newKey === key)
        return

    const callbacks: MDIObservable<any> = localCallbacksStore[key] ?? defaultObservable
    localCallbacksStore[newKey] = callbacks
    delete localCallbacksStore[key]
}

export function onUpdate(key: string, data: any) {
    const callbacks: MDIObservable<any> = localCallbacksStore[key] ?? defaultObservable
    callbacks.onUpdate.forEach(updCb => updCb(data))
}

export function onClose(key: string, data: any, remove: boolean) {
    const callbacks: MDIObservable<any> = localCallbacksStore[key] ?? defaultObservable
    callbacks.onClose.forEach(updCb => updCb(data, remove))
}

export function reset() {
    for (const key in localCallbacksStore) {
        delete localCallbacksStore[key]
    }
}