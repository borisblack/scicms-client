import {useCallback, useMemo, useRef, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, message, Modal, Space} from 'antd'
import appConfig from '../../config'
import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'
import {findAllRelated, getColumns, getHiddenColumns, getInitialData} from '../../util/datagrid'
import {Attribute, Item, ItemData, RelType, UserInfo} from '../../types'
import {useTranslation} from 'react-i18next'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined, SelectOutlined} from '@ant-design/icons'
import {ID_ATTR_NAME, SOURCE_ATTR_NAME, TARGET_ATTR_NAME} from '../../config/constants'
import {Callback, CallbackOperation} from '../../services/mediator'
import MutationService from '../../services/mutation'
import ItemService from '../../services/item'
import QueryService, {ItemFiltersInput} from '../../services/query'
import SearchDataGridWrapper from './SearchDataGridWrapper'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import * as ACL from '../../util/acl'
import PermissionService from '../../services/permission'

interface Props {
    me: UserInfo
    pageKey: string
    item: Item
    itemData: ItemData
    relAttrName: string
    relAttribute: Attribute
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => void
    onItemView: (item: Item, id: string, extra?: Record<string, any>, cb?: Callback, observerKey?: string) => void
    onItemDelete: (itemName: string, id: string) => void
}

const SELECTION_MODAL_WIDTH = 800

export default function RelationsDataGridWrapper({me, pageKey, item, itemData, relAttrName, relAttribute, onItemCreate, onItemView, onItemDelete}: Props) {
    if (!relAttribute.target || (relAttribute.relType !== RelType.oneToMany && relAttribute.relType !== RelType.manyToMany))
        throw Error('Illegal attribute')

    if (relAttribute.inversedBy && relAttribute.mappedBy)
        throw Error('Illegal attribute')

    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const [isSelectionModalVisible, setSelectionModalVisible] = useState<boolean>(false)
    const createdIds = useRef<Set<string>>(new Set())
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])
    const mutationService = useMemo(() => MutationService.getInstance(), [])
    const [target, intermediate] = useMemo(
        () => ([
            itemService.getByName(relAttribute.target as string),
            relAttribute.intermediate ? itemService.getByName(relAttribute.intermediate) : null
        ]),
        [itemService, relAttribute.target, relAttribute.intermediate]
    )
    const columns = useMemo(() => getColumns(target), [target])
    const isOneToMany = useMemo(() => relAttribute.relType === RelType.oneToMany, [relAttribute.relType])

    const isNew = !itemData?.id
    const isLockedByMe = itemData?.lockedBy?.data?.id === me.id
    const [canEdit] = useMemo(() => {
        const acl = permissionService.getAcl(me, item, itemData)
        const canEdit = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return [canEdit]
    }, [isLockedByMe, isNew, item, itemData, me, permissionService])

    const oppositeAttrName = useMemo((): string | undefined => {
        const relAttribute = item.spec.attributes[relAttrName]
        return relAttribute.inversedBy ?? relAttribute.mappedBy
    }, [item.spec.attributes, relAttrName])

    const hiddenColumnsMemoized = useMemo(() => {
        const hiddenColumns = getHiddenColumns(target)
        return oppositeAttrName ? [...hiddenColumns, oppositeAttrName] : hiddenColumns
    }, [oppositeAttrName, target])

    const [sourceAttrName, targetAttrName] = useMemo(
        () => (relAttribute.inversedBy || (!relAttribute.inversedBy && !relAttribute.mappedBy)) ?
            [SOURCE_ATTR_NAME, TARGET_ATTR_NAME] :
            [TARGET_ATTR_NAME, SOURCE_ATTR_NAME],
        [relAttribute])

    const handleRequest = useCallback(async (params: RequestParams) => {
        try {
            setLoading(true)
            const dataWithPagination = await findAllRelated(item.name, itemData.id, relAttrName, target, params)
            setData(dataWithPagination)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [item.name, itemData.id, relAttrName, target])

    const refresh = () => setVersion(prevVersion => prevVersion + 1)

    const processExistingManyToManyRelation = useCallback(async (operation: CallbackOperation, id: string) => {
        if (relAttribute.relType !== RelType.manyToMany || !intermediate)
            throw Error('Illegal attribute')

        if (operation === CallbackOperation.DELETE) {
            setLoading(true)
            try {
                const intermediatesToDelete = await queryService.findAllBy(intermediate, {[targetAttrName]: {id: {eq: id}}} as unknown as ItemFiltersInput<ItemData>) // must be only one
                for (const intermediateToDelete of intermediatesToDelete) {
                    await mutationService.delete(intermediate, intermediateToDelete.id, appConfig.mutation.deletingStrategy)
                }
                createdIds.current.delete(id)
                refresh()
            } catch (e: any) {
                console.error(e.message)
                message.error(e.message)
            } finally {
                setLoading(false)
            }
        }
    }, [targetAttrName, mutationService, queryService, intermediate, relAttribute.relType])

    const processCreatedManyToManyRelation = useCallback(async (operation: CallbackOperation, id: string) => {
        if (relAttribute.relType !== RelType.manyToMany || !intermediate)
            throw Error('Illegal attribute')

        if (operation === CallbackOperation.UPDATE && !createdIds.current.has(id)) {
            setLoading(true)
            try {
                await mutationService.create(intermediate, {[sourceAttrName]: itemData.id, [targetAttrName]: id})
                createdIds.current.add(id)
                refresh()
            } catch (e: any) {
                console.error(e.message)
                message.error(e.message)
            } finally {
                setLoading(false)
            }
        }

        await processExistingManyToManyRelation(operation, id)
    }, [sourceAttrName, targetAttrName, itemData.id, mutationService, processExistingManyToManyRelation, relAttribute, intermediate])

    const createManyToOneInitialData = useCallback((): ItemData | null => {
        if (relAttribute.relType !== RelType.oneToMany || !oppositeAttrName)
            throw new Error('Illegal attribute')

        const initialData: any = {id: itemData.id}
        if (item.titleAttribute !== ID_ATTR_NAME)
            initialData[item.titleAttribute] = itemData[item.titleAttribute]

        return {[oppositeAttrName]: {data: initialData}} as ItemData
    }, [oppositeAttrName, relAttribute.relType, itemData, item])

    const handleCreate = useCallback(() => {
        if (isOneToMany) {
            const initialData = createManyToOneInitialData()
            onItemCreate(target, initialData, refresh, pageKey)
        } else {
            onItemCreate(target, null, processCreatedManyToManyRelation, pageKey)
        }
    }, [createManyToOneInitialData, isOneToMany, onItemCreate, pageKey, processCreatedManyToManyRelation, target])

    const handleManyToManySelect = useCallback(async (selectedItemData: ItemData) => {
        if (relAttribute.relType !== RelType.manyToMany || !intermediate)
            throw Error('Illegal attribute')

        await mutationService.create(intermediate, {[sourceAttrName]: itemData.id, [targetAttrName]: selectedItemData.id})

        refresh()
        setSelectionModalVisible(false)
    }, [sourceAttrName, targetAttrName, itemData.id, mutationService, relAttribute, intermediate])

    const openTarget = useCallback(
        (id: string) => onItemView(target, id, undefined, isOneToMany ? refresh : processExistingManyToManyRelation, pageKey),
        [onItemView, target, isOneToMany, processExistingManyToManyRelation, pageKey])

    const deleteTarget = useCallback(async (id: string, purge: boolean = false) => {
        setLoading(true)
        try {
            if (purge)
                await mutationService.purge(target, id, appConfig.mutation.deletingStrategy)
            else
                await mutationService.delete(target, id, appConfig.mutation.deletingStrategy)
            await onItemDelete(target.name, id)
            await refresh()
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [mutationService, target, onItemDelete])

    const deleteIntermediate = useCallback(async (targetId: string) => {
        if (intermediate == null) {
            console.log('Intermediate is null.')
            return
        }

        setLoading(true)
        try {
            const intermediatesToDelete =
                await queryService.findAllBy(intermediate, {[targetAttrName]: {id: {eq: targetId}}} as unknown as ItemFiltersInput<ItemData>) // must be only one
            for (const intermediateToDelete of intermediatesToDelete) {
                await mutationService.delete(intermediate, intermediateToDelete.id, appConfig.mutation.deletingStrategy)
            }
            createdIds.current.delete(targetId)
            refresh()
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [intermediate, queryService, targetAttrName, mutationService])

    const getRowContextMenu = useCallback((row: Row<ItemData>) => {
        const items: ItemType[] = [{
            key: 'open',
            label: t('Open'),
            icon: <FolderOpenOutlined/>,
            onClick: () => openTarget(row.original.id)
        }]

        const rowPermissionId = row.original.permission?.data?.id
        const rowPermission = rowPermissionId ? permissionService.findById(rowPermissionId) : null
        const canDelete = !!rowPermission && ACL.canDelete(me, rowPermission) && !relAttribute.readOnly
        if (canDelete) {
            if (isOneToMany) {
                if (target.versioned) {
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
            } else { // manyToMany
                items.push({
                    key: 'delete',
                    label: t('Delete'),
                    icon: <DeleteTwoTone twoToneColor="#eb2f96"/>,
                    onClick: () => deleteIntermediate(row.original.id)
                })
            }
        }

        return items
    }, [t, permissionService, me, relAttribute.readOnly, openTarget, target.versioned, deleteTarget])

    const renderToolbar = useCallback(() => {
        if (/*!canEdit || */relAttribute.readOnly)
            return null

        const targetPermissionId = target.permission.data?.id
        const targetPermission = targetPermissionId ? permissionService.findById(targetPermissionId) : null
        const canCreateTarget = !!targetPermission && ACL.canCreate(me, targetPermission)

        return (
            <Space>
                {!isOneToMany && <Button size="small" icon={<SelectOutlined/>} onClick={() => setSelectionModalVisible(true)}>{t('Select')}</Button>}
                {canCreateTarget && <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>}
            </Space>
        )
    }, [handleCreate, isOneToMany, me, permissionService, relAttribute.readOnly, t, target.permission.data?.id])

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
                title={t(target.displayPluralName)}
                getRowContextMenu={getRowContextMenu}
                onRequest={handleRequest}
                onRowDoubleClick={row => openTarget(row.original.id)}
            />

            <Modal
                title={`${t('Select')}: ${t(target.displayName)}`}
                open={isSelectionModalVisible}
                destroyOnClose
                width={SELECTION_MODAL_WIDTH}
                footer={null}
                onCancel={() => setSelectionModalVisible(false)}
            >
                <SearchDataGridWrapper
                    item={target}
                    onSelect={itemData => handleManyToManySelect(itemData)}
                />
            </Modal>
        </>
    )
}