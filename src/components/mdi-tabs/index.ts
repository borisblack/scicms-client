import {ReactNode} from 'react'

export interface MDITab<T> {
    key: string | ((data: T) => string)
    label: ReactNode | ((data: T) => ReactNode)
    data: T
    render?: (data: T) => ReactNode
    onUpdate: ((updatedData: T) => void)[]
    onClose: ((closedData: T, remove: boolean) => void)[]
}

export interface MDIContext<T> {
    items: Record<string, MDITab<T>>
    activeKey?: string
    setActiveKey: (activeKey: string) => void
    openTab: (item: MDITab<T>) => void
    updateTab: (key: string, data: T) => void
    updateActiveTab: (data: T) => void
    closeTab: (key: string, remove?: boolean) => void
    closeActiveTab: (remove?: boolean) => void
}

export const getTabKey = <T,>(item: MDITab<T>, data?: T) =>
    (typeof item.key === 'function') ? item.key(data ?? item.data) : item.key

export const getTabLabel = (item: MDITab<any>) =>
    (typeof item.label === 'function') ? item.label(item.data) : item.label