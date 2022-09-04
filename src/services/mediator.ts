export default class Mediator {
    private static instance: Mediator | null = null

    static getInstance() {
        if (!Mediator.instance)
            Mediator.instance = new Mediator()

        return Mediator.instance
    }

    private observers: {[key: string]: Set<string>} = {}
    private observables: {[key: string]: Set<() => void>} = {}

    addObserver(observerKey: string, observableKey: string, callbacks: (() => void)[]) {
        const prevObservables: Set<string> = this.observers[observerKey] ?? new Set()
        this.observers[observerKey] = prevObservables.add(observableKey)

        this.addObservable(observableKey, callbacks)
    }

    addObservable(key: string, callbacks: (() => void)[]) {
        const cbs: Set<() => void> = this.observables[key] ?? new Set()
        callbacks.forEach(cb => cbs.add(cb))

        this.observables[key] = cbs
    }

    runObservableCallbacks(key: string) {
        const callbacks = this.observables[key]
        callbacks?.forEach(it => {
            it()
        })
    }

    removeKey(key: string) {
        this.removeObserver(key)
        this.removeObservable(key)
    }

    removeObserver(key: string) {
        const observableKeys = this.observers[key]
        if (!observableKeys)
            return

        observableKeys.forEach(observableKey => this.removeObservable(observableKey))

        delete this.observers[key]
    }

    removeObservable(key: string) {
        delete this.observables[key]
    }

    changeKey(oldKey: string, newKey: string) {
        this.changeObserverKey(oldKey, newKey)
        this.changeObservableKey(oldKey, newKey)
    }

    changeObserverKey(oldKey: string, newKey: string) {
        const observableKeys = this.observers[oldKey]
        if (!observableKeys)
            return

        delete this.observers[oldKey]

        if (observableKeys.has(oldKey)) {
            observableKeys.delete(oldKey)
            observableKeys.add(newKey)
        }

        this.observers[newKey] = observableKeys
    }

    changeObservableKey(oldKey: string, newKey: string) {
        const callbacks = this.observables[oldKey]
        if (!callbacks)
            return

        delete this.observables[oldKey]
        this.observables[newKey] = callbacks
    }
}