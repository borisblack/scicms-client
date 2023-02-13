import _ from 'lodash'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, Form, Modal, Space} from 'antd'
import {useTranslation} from 'react-i18next'

import {CustomComponentRenderContext} from '../../index'
import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME} from '../../../config/constants'
import ItemTemplateService from '../../../services/item-template'
import {Index, ItemSpec} from '../../../types'
import PermissionService from '../../../services/permission'
import DataGrid, {DataWithPagination, RequestParams} from '../../../components/datagrid/DataGrid'
import appConfig from '../../../config'
import {getHiddenIndexColumns, getIndexColumns, getInitialData, NamedIndex, processLocal} from '../../../util/datagrid'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import IndexForm from './IndexForm'

export default function Indexes({me, item, buffer, data, onBufferChange}: CustomComponentRenderContext) {
    if (item.name !== ITEM_TEMPLATE_ITEM_NAME && item.name !== ITEM_ITEM_NAME)
        throw new Error('Illegal attribute')

    const isNew = !data?.id
    const isLockedByMe = data?.lockedBy?.data?.id === me.id
    const {t} = useTranslation()
    const [version, setVersion] = useState<number>(0)
    const itemTemplateService = useMemo(() => ItemTemplateService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const permissions = useMemo(() => {
        const acl = permissionService.getAcl(me, item, data)
        const canEdit = (isNew && acl.canCreate) || (!data?.core && isLockedByMe && acl.canWrite)
        return [canEdit]
    }, [data, isLockedByMe, isNew, item, me, permissionService])

    const [canEdit] = permissions
    const columns = useMemo(() => getIndexColumns(), [])
    const hiddenColumns = useMemo(() => getHiddenIndexColumns(), [])
    const spec: ItemSpec = useMemo(() => data ? {...data.spec} : {}, [data])

    const initialNamedIndexes = useMemo((): NamedIndex[] => {
        const indexes = spec.indexes ?? {}
        let namedIndexes = Object.keys(indexes)
            .map(indexName => ({name: indexName, ...indexes[indexName]}))

        if (item.name !== ITEM_TEMPLATE_ITEM_NAME && namedIndexes.length > 0 && !isNew) {
            const excludedIndexNameSet = new Set()
            for (const itemTemplateName of data.includeTemplates) {
                const itemTemplate = itemTemplateService.getByName(itemTemplateName)
                for (const excludedIndexName in itemTemplate.spec.indexes)
                    excludedIndexNameSet.add(excludedIndexName)
            }
            namedIndexes = namedIndexes.filter(it => !excludedIndexNameSet.has(it.name))
        }

        return namedIndexes

    }, [data?.includeTemplates, isNew, item.name, itemTemplateService, spec.indexes])
    const [namedIndexes, setNamedIndexes] = useState<NamedIndex[]>(initialNamedIndexes)
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedIndex>>(getInitialData())
    const [selectedIndex, setSelectedIndex] = useState<NamedIndex | null>(null)
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false)
    const [indexForm] = Form.useForm()

    useEffect(() => {
        const newIndexes: {[name: string]: Index} = {}
        namedIndexes.forEach(it => {
            const newIndex: any = {...it}
            newIndexes[it.name] = newIndex
            delete newIndex.name
        })
        spec.indexes = newIndexes
        onBufferChange({spec})
    }, [namedIndexes, spec])

    const handleRequest = useCallback(async (params: RequestParams) => {
        setFilteredData(processLocal(namedIndexes, params))
    }, [namedIndexes])

    const openRow = useCallback((row: Row<NamedIndex>) => {
        setSelectedIndex(row.original)
        setEditModalVisible(true)
    }, [])

    const handleRowDoubleClick = useCallback(async (row: Row<NamedIndex>) => {
        openRow(row)
    }, [openRow])

    const parseValues = useCallback((values: NamedIndex): NamedIndex => {
        const parsedValues: any = {}
        _.forOwn(values, (value, key) => {
            if (value == null)
                return

            if (key === 'columns') {
                parsedValues[key] = (value as string).split('\n')
                return
            }

            parsedValues[key] = value
        })

        return parsedValues
    }, [])

    const refresh = () => setVersion(prevVersion => prevVersion + 1)

    const handleIndexFormFinish = useCallback((values: NamedIndex) => {
        if (!canEdit)
            return

        const parsedValues = parseValues(values)
        const {name} = parsedValues
        if (!name)
            throw new Error('Illegal attribute')

        if (name in (spec.indexes ?? {}))
            setNamedIndexes(prevNamedIndexes => prevNamedIndexes.map(it => it.name === name ? {...parsedValues} : it))
        else
            setNamedIndexes([...namedIndexes, {...parsedValues}])

        refresh()
        setEditModalVisible(false)
    }, [canEdit, namedIndexes, parseValues, spec.indexes])

    const handleCreate = useCallback(() => {
        setSelectedIndex(null)
        setEditModalVisible(true)
    }, [])

    const renderToolbar = useCallback(() => {
        return (
            <Space>
                {canEdit && <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>}
            </Space>
        )
    }, [canEdit, handleCreate, t])

    const deleteRow = useCallback((row: Row<NamedIndex>) => {
        setNamedIndexes(prevNamedIndexes => prevNamedIndexes.filter(it => it.name !== row.original.name))
        refresh()
    }, [])

    const getRowContextMenu = useCallback((row: Row<NamedIndex>) => {
        const items: ItemType[] = [{
            key: 'open',
            label: t('Open'),
            icon: <FolderOpenOutlined/>,
            onClick: () => openRow(row)
        }]

        if (canEdit) {
            items.push({
                key: 'delete',
                label: t('Delete'),
                icon: <DeleteTwoTone twoToneColor="#eb2f96"/>,
                onClick: () => deleteRow(row)
            })
        }

        return items
    }, [t, canEdit, openRow, deleteRow])

    return (
        <>
            <DataGrid
                columns={columns}
                data={filteredData}
                initialState={{
                    hiddenColumns: hiddenColumns,
                    pageSize: appConfig.query.defaultPageSize
                }}
                toolbar={renderToolbar()}
                version={version}
                title={t('Indexes')}
                getRowContextMenu={getRowContextMenu}
                onRequest={handleRequest}
                onRowDoubleClick={handleRowDoubleClick}
            />
            <Modal
                title={t('Index')}
                open={isEditModalVisible}
                destroyOnClose
                onOk={() => indexForm.submit()}
                onCancel={() => setEditModalVisible(false)}
            >
                <IndexForm form={indexForm} index={selectedIndex} canEdit={canEdit} onFormFinish={handleIndexFormFinish}/>
            </Modal>
        </>
    )
}