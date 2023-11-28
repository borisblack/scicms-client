import {useCallback, useMemo, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, message, Space} from 'antd'

import appConfig from '../../../config'
import DataGrid, {RequestParams} from '../../../components/datagrid/DataGrid'
import {findAll, getColumns, getHiddenColumns, getInitialData} from '../../../util/datagrid'
import {Item, ItemData} from '../../../types'
import {useTranslation} from 'react-i18next'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {Callback} from '../../../services/mediator'
import MutationManager from '../../../services/mutation'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import * as ACL from '../../../util/acl'
import {useAcl, useItems, useMe, usePermissions} from '../../../util/hooks'

interface Props {
    uniqueKey: string
    itemName: string
    targetItemName: string
    mappedBy: string
    mappedByValue: any
    itemData?: ItemData | null
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => void
    onItemView: (item: Item, id: string, extra?: Record<string, any>, cb?: Callback, observerKey?: string) => void
    onItemDelete: (itemName: string, id: string) => void
}

export default function OneToManyDataGridWrapper({uniqueKey, itemName, targetItemName, mappedBy, mappedByValue, itemData, onItemCreate, onItemView, onItemDelete}: Props) {
    const me = useMe()
    const itemMap = useItems()
    const permissionMap = usePermissions()
    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const item = useMemo(() => itemMap[itemName], [itemMap, itemName])
    const targetItem = useMemo(() => itemMap[targetItemName], [itemMap, targetItemName])
    const columns = useMemo(() => getColumns(itemMap, targetItem), [itemMap, targetItem])
    const mutationManager = useMemo(() => new MutationManager(itemMap), [itemMap])
    const acl = useAcl(item, itemData)

    const hiddenColumnsMemoized = useMemo(() => {
        const hiddenColumns = getHiddenColumns(targetItem)
        return [...hiddenColumns, mappedBy]
    }, [mappedBy, targetItem])

    const handleRequest = useCallback(async (params: RequestParams) => {
        try {
            setLoading(true)
            const dataWithPagination = await findAll(itemMap, targetItem, params, {[mappedBy]: {eq: mappedByValue}})
            setData(dataWithPagination)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [itemMap, mappedBy, mappedByValue, targetItem])

    const refresh = () => setVersion(prevVersion => prevVersion + 1)

    const createManyToOneInitialData = useCallback((): ItemData => ({[mappedBy]: mappedByValue} as ItemData), [mappedBy, mappedByValue])

    const handleCreate = useCallback(() => {
        const initialData = createManyToOneInitialData()
        onItemCreate(targetItem, initialData, refresh, uniqueKey)
    }, [createManyToOneInitialData, onItemCreate, uniqueKey, targetItem])

    const openTarget = useCallback(
        (id: string) => onItemView(targetItem, id, undefined, refresh, uniqueKey),
        [onItemView, targetItem, uniqueKey])

    const deleteTarget = useCallback(async (id: string, purge: boolean = false) => {
        setLoading(true)
        try {
            if (purge)
                await mutationManager.purge(targetItem, id, appConfig.mutation.deletingStrategy)
            else
                await mutationManager.remove(targetItem, id, appConfig.mutation.deletingStrategy)
            await onItemDelete(targetItem.name, id)
            await refresh()
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [mutationManager, targetItem, onItemDelete])

    const getRowContextMenu = useCallback((row: Row<ItemData>) => {
        const items: ItemType[] = [{
            key: 'open',
            label: t('Open'),
            icon: <FolderOpenOutlined/>,
            onClick: () => openTarget(row.original.id)
        }]

        const rowPermissionId = row.original.permission?.data?.id
        const rowPermission = rowPermissionId ? permissionMap[rowPermissionId] : null
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
    }, [t, permissionMap, me, openTarget, targetItem.versioned, deleteTarget])

    const renderToolbar = useCallback(() => {
        // if (!acl.canWrite)
        //     return null

        const targetPermissionId = targetItem.permission.data?.id
        const targetPermission = targetPermissionId ? permissionMap[targetPermissionId] : null
        const canCreateTarget = !!targetPermission && ACL.canCreate(me, targetPermission)

        return (
            <Space>
                {canCreateTarget && <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>}
            </Space>
        )
    }, [acl.canWrite, handleCreate, me, permissionMap, t, targetItem.permission.data?.id])

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