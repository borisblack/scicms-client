import {useCallback, useMemo, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, message, Space} from 'antd'

import appConfig from '../../config'
import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'
import {findAll, getColumns, getHiddenColumns, getInitialData} from '../../util/datagrid'
import {Item, ItemData, UserInfo} from '../../types'
import {useTranslation} from 'react-i18next'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {Callback} from '../../services/mediator'
import MutationService from '../../services/mutation'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import * as ACL from '../../util/acl'
import PermissionService from '../../services/permission'
import ItemService from '../../services/item'

interface Props {
    me: UserInfo
    pageKey: string
    itemName: string
    targetItemName: string
    mappedBy: string
    mappedByValue: any
    itemData?: ItemData | null
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => void
    onItemView: (item: Item, id: string, cb?: Callback, observerKey?: string) => void
    onItemDelete: (itemName: string, id: string) => void
}

export default function OneToManyDataGridWrapper({me, pageKey, itemName, targetItemName, mappedBy, mappedByValue, itemData, onItemCreate, onItemView, onItemDelete}: Props) {
    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const mutationService = useMemo(() => MutationService.getInstance(), [])
    const item = useMemo(() => itemService.getByName(itemName), [itemService, targetItemName])
    const targetItem = useMemo(() => itemService.getByName(targetItemName), [itemService, targetItemName])
    const columns = useMemo(() => getColumns(targetItem), [targetItem])

    const isNew = !itemData?.id
    const isLockedByMe = itemData?.lockedBy?.data?.id === me.id
    const [canEdit] = useMemo(() => {
        const acl = permissionService.getAcl(me, item, itemData)
        const canEdit = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return [canEdit]
    }, [isLockedByMe, isNew, item, itemData, me, permissionService])

    const hiddenColumnsMemoized = useMemo(() => {
        const hiddenColumns = getHiddenColumns(targetItem)
        return [...hiddenColumns, mappedBy]
    }, [mappedBy, targetItem])

    const handleRequest = useCallback(async (params: RequestParams) => {
        try {
            setLoading(true)
            const dataWithPagination = await findAll(targetItem, params, {[mappedBy]: {eq: mappedByValue}})
            setData(dataWithPagination)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [mappedBy, mappedByValue, targetItem])

    const refresh = () => setVersion(prevVersion => prevVersion + 1)

    const createManyToOneInitialData = useCallback((): ItemData => ({[mappedBy]: mappedByValue} as ItemData), [mappedBy, mappedByValue])

    const handleCreate = useCallback(() => {
        const initialData = createManyToOneInitialData()
        onItemCreate(targetItem, initialData, refresh, pageKey)
    }, [createManyToOneInitialData, onItemCreate, pageKey, targetItem])

    const openTarget = useCallback(
        (id: string) => onItemView(targetItem, id, refresh, pageKey),
        [onItemView, targetItem, pageKey])

    const deleteTarget = useCallback(async (id: string, purge: boolean = false) => {
        setLoading(true)
        try {
            if (purge)
                await mutationService.purge(targetItem, id, appConfig.mutation.deletingStrategy)
            else
                await mutationService.delete(targetItem, id, appConfig.mutation.deletingStrategy)
            await onItemDelete(targetItem.name, id)
            await refresh()
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [mutationService, targetItem, onItemDelete])

    const getRowContextMenu = useCallback((row: Row<ItemData>) => {
        const items: ItemType[] = [{
            key: 'open',
            label: t('Open'),
            icon: <FolderOpenOutlined/>,
            onClick: () => openTarget(row.original.id)
        }]

        const rowPermissionId = row.original.permission?.data?.id
        const rowPermission = rowPermissionId ? permissionService.findById(rowPermissionId) : null
        const canDelete = !!rowPermission && ACL.canDelete(me, rowPermission)
        if (canDelete) {
            if (targetItem.versioned) {
                items.push({
                    key: 'delete',
                    label: t('Delete'),
                    icon: <DeleteTwoTone twoToneColor="#eb2f96"/>,
                    children: [{
                        key: 'delete',
                        label: t('Current Version'),
                        onClick: () => deleteTarget(row.original.id)
                    }, {
                        key: 'purge',
                        label: t('All Versions'),
                        onClick: () => deleteTarget(row.original.id, true)
                    }]
                })
            } else {
                items.push({
                    key: 'delete',
                    label: t('Delete'),
                    icon: <DeleteTwoTone twoToneColor="#eb2f96"/>,
                    onClick: () => deleteTarget(row.original.id)
                })
            }
        }

        return items
    }, [t, permissionService, me, openTarget, targetItem.versioned, deleteTarget])

    const renderToolbar = useCallback(() => {
        // if (!canEdit)
        //     return null

        const targetPermissionId = targetItem.permission.data?.id
        const targetPermission = targetPermissionId ? permissionService.findById(targetPermissionId) : null
        const canCreateTarget = !!targetPermission && ACL.canCreate(me, targetPermission)

        return (
            <Space>
                {canCreateTarget && <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>}
            </Space>
        )
    }, [canEdit, handleCreate, me, permissionService, t, targetItem.permission.data?.id])

    return (
        <>
            <DataGrid
                loading={loading}
                columns={columns}
                data={data}
                version={version}
                initialState={{
                    hiddenColumns: hiddenColumnsMemoized,
                    pageSize: appConfig.query.defaultPageSize
                }}
                toolbar={renderToolbar()}
                title={t(targetItem.displayPluralName)}
                getRowContextMenu={getRowContextMenu}
                onRequest={handleRequest}
                onRowDoubleClick={row => openTarget(row.original.id)}
            />
        </>
    )
}