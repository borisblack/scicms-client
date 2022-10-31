import {useCallback, useMemo, useRef, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, Menu, message, Modal, Space} from 'antd'

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
import QueryService, {FiltersInput} from '../../services/query'
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
    onItemView: (item: Item, id: string, cb?: Callback, observerKey?: string) => void
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
    const target = useMemo(() => itemService.getByName(relAttribute.target as string), [itemService, relAttribute.target])
    const columns = useMemo(() => getColumns(target), [target])
    const isOneToMany = useMemo(() => relAttribute.relType === RelType.oneToMany, [relAttribute.relType])

    const oppositeAttrName = useMemo((): string | undefined => {
        const relAttribute = item.spec.attributes[relAttrName]
        return relAttribute.inversedBy ?? relAttribute.mappedBy
    }, [item.spec.attributes, relAttrName])

    const hiddenColumnsMemoized = useMemo(() => {
        const hiddenColumns = getHiddenColumns(target)
        return oppositeAttrName ? [...hiddenColumns, oppositeAttrName] : hiddenColumns
    }, [oppositeAttrName, target])

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

    const getSourceTargetAttrNames = useCallback((): string[] => {
        let sourceAttrName: string, targetAttrName: string
        if (relAttribute.inversedBy || (!relAttribute.inversedBy && !relAttribute.mappedBy)) {
            sourceAttrName = SOURCE_ATTR_NAME
            targetAttrName = TARGET_ATTR_NAME
        } else {
            sourceAttrName = TARGET_ATTR_NAME
            targetAttrName = SOURCE_ATTR_NAME
        }
        return [sourceAttrName, targetAttrName]
    }, [relAttribute])

    const processExistingManyToManyRelation = useCallback(async (operation: CallbackOperation, id: string) => {
        if (relAttribute.relType !== RelType.manyToMany || !relAttribute.intermediate)
            throw Error('Illegal attribute')

        if (operation === CallbackOperation.DELETE) {
            const intermediate = itemService.getByName(relAttribute.intermediate)
            const [, targetAttrName] = getSourceTargetAttrNames()
            setLoading(true)
            try {
                const intermediatesToDelete = await queryService.findAllBy(intermediate, {[targetAttrName]: {id: {eq: id}}} as unknown as FiltersInput<ItemData>) // must be only one
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
    }, [getSourceTargetAttrNames, itemService, mutationService, queryService, relAttribute.intermediate, relAttribute.relType])

    const processCreatedManyToManyRelation = useCallback(async (operation: CallbackOperation, id: string) => {
        if (relAttribute.relType !== RelType.manyToMany || !relAttribute.intermediate)
            throw Error('Illegal attribute')

        if (operation === CallbackOperation.UPDATE && !createdIds.current.has(id)) {
            const intermediate = itemService.getByName(relAttribute.intermediate)
            const [sourceAttrName, targetAttrName] = getSourceTargetAttrNames()
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
    }, [getSourceTargetAttrNames, itemData.id, itemService, mutationService, processExistingManyToManyRelation, relAttribute])

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
        if (relAttribute.relType !== RelType.manyToMany || !relAttribute.intermediate)
            throw Error('Illegal attribute')

        const intermediate = itemService.getByName(relAttribute.intermediate)
        const [sourceAttrName, targetAttrName] = getSourceTargetAttrNames()
        await mutationService.create(intermediate, {[sourceAttrName]: itemData.id, [targetAttrName]: selectedItemData.id})

        refresh()
        setSelectionModalVisible(false)
    }, [getSourceTargetAttrNames, itemData.id, itemService, mutationService, relAttribute])

    const openTarget = useCallback(
        (id: string) => onItemView(target, id, isOneToMany ? refresh : processExistingManyToManyRelation, pageKey),
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
        }

        return <Menu items={items}/>
    }, [t, permissionService, me, relAttribute.readOnly, openTarget, target.versioned, deleteTarget])

    const renderToolbar = useCallback(() => {
        if (relAttribute.readOnly)
            return null

        const targetPermissionId = target.permission.data?.id
        const targetPermission = targetPermissionId ? permissionService.findById(targetPermissionId) : null
        const canCreate = !!targetPermission && ACL.canCreate(me, targetPermission)

        return (
            <Space>
                {!isOneToMany && <Button size="small" icon={<SelectOutlined/>} onClick={() => setSelectionModalVisible(true)}>{t('Select')}</Button>}
                {canCreate && <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>}
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
                title={`${t('Select')} ${target.displayName}`}
                visible={isSelectionModalVisible}
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