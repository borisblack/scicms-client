import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {TypedUseSelectorHook} from 'react-redux'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {notification} from 'antd'

import type {AppDispatch, RootState} from 'src/store'
import PermissionManager, {Acl} from 'src/services/permission'
import {UserInfo, ViewType} from 'src/types'
import {Item, ItemData, ItemTab} from 'src/types/schema'
import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME} from 'src/config/constants'
import {logout as doLogout, selectIsExpired, selectMe} from 'src/features/auth/authSlice'
import {
  initializeIfNeeded as doInitializeIfNeeded,
  RegistryState,
  reset as resetRegistry,
  selectCoreConfig,
  selectIsInitialized,
  selectItems,
  selectItemTemplates,
  selectLifecycles,
  selectLoading as selectRegistryLoading,
  selectLocales,
  selectPermissions,
  selectProperties
} from 'src/features/registry/registrySlice'
import QueryManager from 'src/services/query'
import MutationManager from 'src/services/mutation'
import {useMDIContext} from '../uiKit/MDITabs/hooks'
import {createMDITab, generateKeyById} from './mdi'
import {getAppProperties, getProperty} from 'src/config/util'
import {AppConfig, PropertyKey} from 'src/config'
import {MenuConfig} from 'src/config/menu'

export const useAppDispatch: () => AppDispatch = useDispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current as T | undefined
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

export function useAuth(): {me: UserInfo | null; isExpired: boolean; logout: () => Promise<void>} {
  const dispatch = useAppDispatch()
  const me = useAppSelector(selectMe)
  const isExpired = useAppSelector(selectIsExpired)

  const logout = useCallback(async () => {
    await dispatch(doLogout())
  }, [dispatch])

  return {me, isExpired, logout}
}

interface UseRegistry extends RegistryState {
  initializeIfNeeded: (me: UserInfo) => void
  reset: () => void
}

export function useRegistry(): UseRegistry {
  const dispatch = useAppDispatch()

  const loading = useAppSelector(selectRegistryLoading)
  const isInitialized = useAppSelector(selectIsInitialized)
  const coreConfig = useAppSelector(selectCoreConfig)
  const items = useAppSelector(selectItems)
  const itemTemplates = useAppSelector(selectItemTemplates)
  const permissions = useAppSelector(selectPermissions)
  const lifecycles = useAppSelector(selectLifecycles)
  const locales = useAppSelector(selectLocales)
  const properties = useAppSelector(selectProperties)

  const initializeIfNeeded = useCallback(
    async (me: UserInfo) => {
      await dispatch(doInitializeIfNeeded(me))
    },
    [dispatch]
  )

  const reset = useCallback(async () => {
    dispatch(resetRegistry())
  }, [dispatch])

  return {
    loading,
    isInitialized,
    coreConfig,
    items,
    itemTemplates,
    permissions,
    lifecycles,
    properties,
    locales,
    initializeIfNeeded,
    reset
  }
}

export function useAcl(item: Item, data?: ItemData | null): Acl {
  const {me} = useAuth()
  const {permissions} = useRegistry()
  const isNew = !data?.id
  const isLockedByMe = !!me?.id && data?.lockedBy?.data?.id === me.id
  const permissionManager = useMemo(() => new PermissionManager(permissions), [permissions])

  return useMemo(() => {
    const acl = permissionManager.getAcl(me, item, data)
    acl.canWrite = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
    return acl
  }, [data, isLockedByMe, isNew, item, me, permissionManager])
}

export function useItemAcl(item: Item, data?: ItemData | null): Acl {
  const {me} = useAuth()
  const {permissions} = useRegistry()
  const isNew = !data?.id
  const isLockedByMe = !!me?.id && data?.lockedBy?.data?.id === me.id
  const permissionManager = useMemo(() => new PermissionManager(permissions), [permissions])
  return useMemo(() => {
    const acl = permissionManager.getAcl(me, item, data)
    acl.canWrite = (isNew && acl.canCreate) || (!data?.core && isLockedByMe && acl.canWrite)
    return acl
  }, [data, isLockedByMe, isNew, item, me, permissionManager])
}

export function useFormAcl(item: Item, data?: ItemData | null): Acl {
  const {me} = useAuth()
  const {permissions} = useRegistry()
  const permissionManager = useMemo(() => new PermissionManager(permissions), [permissions])
  const isSystemItem = item.name === ITEM_TEMPLATE_ITEM_NAME || item.name === ITEM_ITEM_NAME
  return useMemo(() => {
    const acl = permissionManager.getAcl(me, item, data)
    acl.canWrite =
      (!isSystemItem || !data?.core) && !item.readOnly && (!item.versioned || !!data?.current) && acl.canWrite
    acl.canDelete = (!isSystemItem || !data?.core) && !item.readOnly && acl.canDelete
    return acl
  }, [data, isSystemItem, item, me, permissionManager])
}

export function useQueryManager(): QueryManager {
  const {items} = useRegistry()

  return useMemo(() => new QueryManager(items), [items])
}

export function useMutationManager(): MutationManager {
  const {items} = useRegistry()

  return useMemo(() => new MutationManager(items), [items])
}

export function useItemOperations() {
  const ctx = useMDIContext<ItemTab>()
  const queryManager = useQueryManager()
  const {t} = useTranslation()

  const create = useCallback(
    (
      item: Item,
      initialData?: ItemData,
      extra?: Record<string, any>,
      onUpdate?: (updatedTab: ItemTab) => void,
      onClose?: (closedTab: ItemTab, remove: boolean) => void
    ) => {
      ctx.openTab(createMDITab(item, ViewType.view, initialData, extra, onUpdate, onClose))
    },
    [ctx]
  )

  const open = useCallback(
    async (
      item: Item,
      id: string,
      extra?: Record<string, any>,
      onUpdate?: (updatedTab: ItemTab) => void,
      onClose?: (closedTab: ItemTab, remove: boolean) => void
    ) => {
      const actualData = await queryManager.findById(item, id)
      if (actualData.data) {
        ctx.openTab(createMDITab(item, ViewType.view, actualData.data, extra, onUpdate, onClose))
      } else {
        notification.error({
          message: t('Opening error'),
          description: t('Item not found. It may have been removed')
        })
      }
    },
    [ctx, queryManager, t]
  )

  const close = useCallback(
    (itemName: string, id: string, extra?: Record<string, any>) => {
      const key = generateKeyById(itemName, ViewType.view, id, extra)
      ctx.closeTab(key, true)
    },
    [ctx]
  )

  return {create, open, close}
}

export function useProperty(path: string): any {
  const {properties} = useRegistry()

  return getProperty(path, properties)
}

interface UseModalProps {
  defaultVisible?: boolean
}

interface UseModal {
  visible: boolean
  modalProps: {
    open: boolean
  }
  show: () => void
  close: () => void
}

export function useModal({defaultVisible}: UseModalProps = {}): UseModal {
  const [open, setOpen] = useState<boolean>(defaultVisible ?? false)

  const handleShow = useCallback(() => setOpen(true), [])

  const handleClose = useCallback(() => setOpen(false), [])

  return {
    visible: open,
    modalProps: {
      open
    },
    show: handleShow,
    close: handleClose
  }
}

export function useAppProperties(): AppConfig {
  const {properties} = useRegistry()

  return getAppProperties(properties)
}

export const useMenuProperties = (): MenuConfig => useProperty(PropertyKey.MENU)
