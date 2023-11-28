import {useEffect, useMemo, useRef, useState} from 'react'
import type {TypedUseSelectorHook} from 'react-redux'
import {useDispatch, useSelector} from 'react-redux'
import type {AppDispatch, RootState} from 'src/store'
import PermissionManager, {Acl, PermissionMap} from 'src/services/permission'
import {Item, ItemData, Locale, UserInfo} from 'src/types'
import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME} from 'src/config/constants'
import {selectMe} from 'src/features/auth/authSlice'
import {
    selectCoreConfig,
    selectItems,
    selectItemTemplates,
    selectLifecycles,
    selectLocales,
    selectPermissions
} from 'src/features/registry/registrySlice'
import {ItemMap} from 'src/services/item'
import QueryManager from 'src/services/query'
import MutationManager from 'src/services/mutation'
import {ItemTemplateMap} from 'src/services/item-template'
import {LifecycleMap} from 'src/services/lifecycle'
import {CoreConfig} from 'src/services/core-config'

export const useAppDispatch: () => AppDispatch = useDispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function usePrevious(value: any): any {
    const ref = useRef()
    useEffect(() => {
        ref.current = value
    })
    return ref.current
}

export function useCache<T>(cb: () => Promise<T>) {
    const cache = useRef<T | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState<T | null>(null)
    useEffect(() => {
        setLoading(true)
        if (cache.current) {
            setData(cache.current)
            setLoading(false)
        } else {
            cb().then(res => {
                cache.current = res
                setData(res)
                setLoading(false)
            })
        }
    }, [cb])

    return {loading, data}
}

export function useMe(): UserInfo | null {
    return useAppSelector(selectMe)
}

export function useItemTemplates(): ItemTemplateMap {
    return useAppSelector(selectItemTemplates)
}

export function useItems(): ItemMap {
    return useAppSelector(selectItems)
}

export function usePermissions(): PermissionMap {
    return useAppSelector(selectPermissions)
}

export function useLifecycles(): LifecycleMap {
    return useAppSelector(selectLifecycles)
}

export function useLocales(): Locale[] {
    return useAppSelector(selectLocales)
}

export function useCoreConfig(): CoreConfig | undefined {
    return useAppSelector(selectCoreConfig)
}

export function useAcl(item: Item, data?: ItemData | null): Acl {
    const me = useMe()
    const permissionMap = usePermissions()
    const isNew = !data?.id
    const isLockedByMe = !!me?.id && data?.lockedBy?.data?.id === me.id
    const permissionManager = useMemo(() => new PermissionManager(permissionMap), [permissionMap])

    return useMemo(() => {
        const acl = permissionManager.getAcl(me, item, data)
        acl.canWrite = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return acl
    }, [data, isLockedByMe, isNew, item, me, permissionManager])
}

export function useItemAcl(item: Item, data?: ItemData | null): Acl {
    const me = useMe()
    const permissionMap = usePermissions()
    const isNew = !data?.id
    const isLockedByMe = !!me?.id && data?.lockedBy?.data?.id === me.id
    const permissionManager = useMemo(() => new PermissionManager(permissionMap), [permissionMap])
    return  useMemo(() => {
        const acl = permissionManager.getAcl(me, item, data)
        acl.canWrite = (isNew && acl.canCreate) || (!data?.core && isLockedByMe && acl.canWrite)
        return acl
    }, [data, isLockedByMe, isNew, item, me, permissionManager])
}

export function useFormAcl(item: Item, data?: ItemData | null): Acl {
    const me = useMe()
    const permissionMap = usePermissions()
    const permissionManager = useMemo(() => new PermissionManager(permissionMap), [permissionMap])
    const isSystemItem = item.name === ITEM_TEMPLATE_ITEM_NAME || item.name === ITEM_ITEM_NAME
    return  useMemo(() => {
        const acl = permissionManager.getAcl(me, item, data)
        acl.canWrite = (!isSystemItem || !data?.core) && !item.readOnly && (!item.versioned || !!data?.current) && acl.canWrite
        acl.canDelete = (!isSystemItem || !data?.core) && !item.readOnly && acl.canDelete
        return acl
    }, [data, isSystemItem, item, me, permissionManager])
}

export function useQueryManager(): QueryManager {
    const items = useItems()

    return useMemo(() => new QueryManager(items), [items])
}

export function useMutationManager(): MutationManager {
    const items = useItems()

    return useMemo(() => new MutationManager(items), [items])
}
