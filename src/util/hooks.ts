import {useEffect, useMemo, useRef, useState} from 'react'
import type {TypedUseSelectorHook} from 'react-redux'
import {useDispatch, useSelector} from 'react-redux'
import type {AppDispatch, RootState} from '../store'
import PermissionManager, {Acl, PermissionMap} from '../services/permission'
import {Item, ItemData, UserInfo} from '../types'
import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME} from '../config/constants'

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

export function useAcl(me: UserInfo, permissionMap: PermissionMap, item: Item, data?: ItemData | null): Acl {
    const isNew = !data?.id
    const isLockedByMe = data?.lockedBy?.data?.id === me.id
    const permissionManager = useMemo(() => new PermissionManager(permissionMap), [permissionMap])

    return useMemo(() => {
        const acl = permissionManager.getAcl(me, item, data)
        acl.canWrite = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return acl
    }, [data, isLockedByMe, isNew, item, me, permissionManager])
}

export function useItemAcl(me: UserInfo, permissionMap: PermissionMap, item: Item, data?: ItemData | null): Acl {
    const isNew = !data?.id
    const isLockedByMe = data?.lockedBy?.data?.id === me.id
    const permissionManager = useMemo(() => new PermissionManager(permissionMap), [permissionMap])
    return  useMemo(() => {
        const acl = permissionManager.getAcl(me, item, data)
        acl.canWrite = (isNew && acl.canCreate) || (!data?.core && isLockedByMe && acl.canWrite)
        return acl
    }, [data, isLockedByMe, isNew, item, me, permissionManager])
}

export function useFormAcl(me: UserInfo, permissionMap: PermissionMap, item: Item, data?: ItemData | null): Acl {
    const permissionManager = useMemo(() => new PermissionManager(permissionMap), [permissionMap])
    const isSystemItem = item.name === ITEM_TEMPLATE_ITEM_NAME || item.name === ITEM_ITEM_NAME
    return  useMemo(() => {
        const acl = permissionManager.getAcl(me, item, data)
        acl.canWrite = (!isSystemItem || !data?.core) && !item.readOnly && (!item.versioned || !!data?.current) && acl.canWrite
        acl.canDelete = (!isSystemItem || !data?.core) && !item.readOnly && acl.canDelete
        return acl
    }, [data, isSystemItem, item, me, permissionManager])
}
