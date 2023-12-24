export interface MDITab<T> {
    key: string
    data: T
}

export interface MDIObservable<T> {
    onUpdate: ((updatedData: T) => void)[]
    onClose: ((closedData: T, remove: boolean) => void)[]
}

export interface MDITabObservable<T> extends MDITab<T>, MDIObservable<T> {}

export interface MDIContext<T> {
    items: MDITab<T>[]
    activeKey?: string
    setActiveKey: (activeKey: string) => void
    openTab: (item: MDITabObservable<T>) => void
    updateTab: (key: string, data: T, newKey?: string) => void
    updateActiveTab: (data: T, newKey?: string) => void
    closeTab: (key: string, remove?: boolean) => void
    closeActiveTab: (remove?: boolean) => void
}
