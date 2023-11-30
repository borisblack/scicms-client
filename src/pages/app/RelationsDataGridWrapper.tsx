import {useCallback, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Row} from '@tanstack/react-table'
import {Button, message, Modal, Space} from 'antd'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined, SelectOutlined} from '@ant-design/icons'
import appConfig from 'src/config'
import DataGrid, {RequestParams} from 'src/components/datagrid/DataGrid'
import {findAllRelated, getColumns, getHiddenColumns, getInitialData} from 'src/util/datagrid'
import {Attribute, ItemData, ItemDataWrapper, RelType} from 'src/types'
import {ID_ATTR_NAME, SOURCE_ATTR_NAME, TARGET_ATTR_NAME} from 'src/config/constants'
import MutationManager from 'src/services/mutation'
import QueryManager, {ItemFiltersInput} from 'src/services/query'
import SearchDataGridWrapper from './SearchDataGridWrapper'
import * as ACL from 'src/util/acl'
import {useAcl, useAuth, useItemOperations, useRegistry} from 'src/util/hooks'

interface Props {
    data: ItemDataWrapper
    relAttrName: string
    relAttribute: Attribute
}

const SELECTION_MODAL_WIDTH = 800

export default function RelationsDataGridWrapper({data: dataWrapper, relAttrName, relAttribute}: Props) {
    const {item, data: itemData} = dataWrapper
    const {me} = useAuth()
    const {items: itemMap, permissions: permissionMap} = useRegistry()
    const {create: createItem, open: openItem, remove: removeItem} = useItemOperations()

    if (!relAttribute.target || (relAttribute.relType !== RelType.oneToMany && relAttribute.relType !== RelType.manyToMany))
        throw Error('Illegal attribute')

    if (relAttribute.inversedBy && relAttribute.mappedBy)
        throw Error('Illegal attribute')

    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [version, setVersion] = useState<number>(0)
    const [isSelectionModalVisible, setSelectionModalVisible] = useState<boolean>(false)
    const createdIds = useRef<Set<string>>(new Set())
    const queryManager = useMemo(() => new QueryManager(itemMap), [itemMap])
    const mutationManager = useMemo(() => new MutationManager(itemMap), [itemMap])
    const [target, intermediate] = useMemo(
        () => ([
            itemMap[relAttribute.target as string],
            relAttribute.intermediate ? itemMap[relAttribute.intermediate] : null
        ]),
        [itemMap, relAttribute.target, relAttribute.intermediate]
    )
    const [data, setData] = useState(getInitialData())
    const columns = useMemo(() => getColumns(itemMap, target), [itemMap, target])
    const isOneToMany = useMemo(() => relAttribute.relType === RelType.oneToMany, [relAttribute.relType])
    const acl = useAcl(item, itemData)

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
        if (itemData?.id == null)
            throw new Error('Item ID is null.')

        try {
            setLoading(true)
            const dataWithPagination = await findAllRelated(itemMap, item.name, itemData.id, relAttrName, target, params)
            setData(dataWithPagination)
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [item.name, itemData?.id, itemMap, relAttrName, target])

    const refresh = () => setVersion(prevVersion => prevVersion + 1)

    const processExistingManyToManyRelation = useCallback(async (updatedItem: ItemDataWrapper, remove: boolean = false) => {
        if (relAttribute.relType !== RelType.manyToMany || !intermediate)
            throw new Error('Illegal attribute.')

        const id = updatedItem.data?.id
        if (id == null)
            throw new Error('ID of updated item must be set.')

        if (remove) {
            setLoading(true)
            try {
                const intermediatesToDelete = await queryManager.findAllBy(intermediate, {[targetAttrName]: {id: {eq: id}}} as unknown as ItemFiltersInput<ItemData>) // must be only one
                for (const intermediateToDelete of intermediatesToDelete) {
                    await mutationManager.remove(intermediate, intermediateToDelete.id, appConfig.mutation.deletingStrategy)
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
    }, [relAttribute.relType, intermediate, queryManager, targetAttrName, mutationManager])

    const processCreatedManyToManyRelation = useCallback(async (updatedItem: ItemDataWrapper, remove: boolean = false) => {
        if (itemData?.id == null)
            throw new Error('Item ID is null.')

        if (relAttribute.relType !== RelType.manyToMany || !intermediate)
            throw new Error('Illegal attribute.')

        const id = updatedItem.data?.id
        if (id == null)
            throw new Error('ID of updated item must be set.')

        if (!remove && !createdIds.current.has(id)) {
            setLoading(true)
            try {
                await mutationManager.create(intermediate, {[sourceAttrName]: itemData.id, [targetAttrName]: id})
                createdIds.current.add(id)
                refresh()
            } catch (e: any) {
                console.error(e.message)
                message.error(e.message)
            } finally {
                setLoading(false)
            }
        }

        await processExistingManyToManyRelation(updatedItem, remove)
    }, [relAttribute.relType, intermediate, processExistingManyToManyRelation, mutationManager, sourceAttrName, itemData?.id, targetAttrName])

    const createManyToOneInitialData = useCallback((): ItemData | undefined => {
        if (itemData?.id == null)
            throw new Error('Item ID is null.')

        if (relAttribute.relType !== RelType.oneToMany || !oppositeAttrName)
            throw new Error('Illegal attribute.')

        const initialData: any = {id: itemData.id}
        if (item.titleAttribute !== ID_ATTR_NAME)
            initialData[item.titleAttribute] = itemData[item.titleAttribute]

        return {[oppositeAttrName]: {data: initialData}} as ItemData
    }, [oppositeAttrName, relAttribute.relType, itemData, item])

    const handleCreate = useCallback(() => {
        if (isOneToMany) {
            const initialData = createManyToOneInitialData()
            createItem(target, initialData, undefined, refresh, refresh)
        } else {
            createItem(target, undefined, undefined, processCreatedManyToManyRelation, processCreatedManyToManyRelation)
        }
    }, [createManyToOneInitialData, isOneToMany, createItem, processCreatedManyToManyRelation, target])

    const handleManyToManySelect = useCallback(async (selectedItemData: ItemData) => {
        if (itemData?.id == null)
            throw new Error('Item ID is null.')

        if (relAttribute.relType !== RelType.manyToMany || !intermediate)
            throw new Error('Illegal attribute.')

        await mutationManager.create(intermediate, {[sourceAttrName]: itemData.id, [targetAttrName]: selectedItemData.id})

        refresh()
        setSelectionModalVisible(false)
    }, [relAttribute.relType, intermediate, mutationManager, sourceAttrName, itemData?.id, targetAttrName])

    const openTarget = useCallback(async (id: string) => {
        const cb = isOneToMany ? refresh : processExistingManyToManyRelation
        await openItem(target, id, undefined, cb, cb)
    }, [openItem, target, isOneToMany, processExistingManyToManyRelation])

    const deleteTarget = useCallback(async (id: string, purge: boolean = false) => {
        setLoading(true)
        try {
            if (purge)
                await mutationManager.purge(target, id, appConfig.mutation.deletingStrategy)
            else
                await mutationManager.remove(target, id, appConfig.mutation.deletingStrategy)
            removeItem(target.name, id)
            refresh()
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [mutationManager, target, removeItem])

    const deleteIntermediate = useCallback(async (targetId: string) => {
        if (intermediate == null) {
            console.log('Intermediate is null.')
            return
        }

        setLoading(true)
        try {
            const intermediatesToDelete =
                await queryManager.findAllBy(intermediate, {[targetAttrName]: {id: {eq: targetId}}} as unknown as ItemFiltersInput<ItemData>) // must be only one
            for (const intermediateToDelete of intermediatesToDelete) {
                await mutationManager.remove(intermediate, intermediateToDelete.id, appConfig.mutation.deletingStrategy)
            }
            createdIds.current.delete(targetId)
            refresh()
        } catch (e: any) {
            console.error(e.message)
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [intermediate, mutationManager, queryManager, targetAttrName])

    const getRowContextMenu = useCallback((row: Row<ItemData>) => {
        const items: ItemType[] = [{
            key: 'open',
            label: t('Open'),
            icon: <FolderOpenOutlined/>,
            onClick: () => openTarget(row.original.id)
        }]

        const rowPermissionId = row.original.permission?.data?.id
        const rowPermission = rowPermissionId ? permissionMap[rowPermissionId] : null
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
    }, [t, permissionMap, me, relAttribute.readOnly, openTarget, isOneToMany, target.versioned, deleteTarget, deleteIntermediate])

    const renderToolbar = useCallback(() => {
        if (/*!acl.canWrite || */relAttribute.readOnly)
            return null

        const targetPermissionId = target.permission.data?.id
        const targetPermission = targetPermissionId ? permissionMap[targetPermissionId] : null
        const canCreateTarget = !!targetPermission && ACL.canCreate(me, targetPermission)

        return (
            <Space>
                {!isOneToMany && <Button size="small" icon={<SelectOutlined/>} onClick={() => setSelectionModalVisible(true)}>{t('Select')}</Button>}
                {canCreateTarget && <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>}
            </Space>
        )
    }, [handleCreate, isOneToMany, me, permissionMap, relAttribute.readOnly, t, target.permission.data?.id])

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