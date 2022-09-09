import _ from 'lodash'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, Form, Menu, Modal, Space} from 'antd'
import {useTranslation} from 'react-i18next'

import {CustomComponentRenderContext} from '../index'
import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME} from '../../config/constants'
import ItemTemplateService from '../../services/item-template'
import {ItemSpec} from '../../types'
import PermissionService from '../../services/permission'
import DataGrid, {DataWithPagination, RequestParams} from '../../components/datagrid/DataGrid'
import appConfig from '../../config'
import {
    getAttributeColumns,
    getHiddenAttributeColumns,
    getInitialData,
    NamedAttribute,
    processLocal
} from '../../util/datagrid'
import AttributeForm from './AttributeForm'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {ItemType} from 'antd/es/menu/hooks/useItems'

const EDIT_MODAL_WIDTH = 800

export default function Attributes({me, item, data}: CustomComponentRenderContext) {
    if (item.name !== ITEM_TEMPLATE_ITEM_NAME && item.name !== ITEM_ITEM_NAME)
        throw new Error('Illegal attribute')

    const isNew = !data?.id
    const {t} = useTranslation()
    const [version, setVersion] = useState<number>(0)
    const itemTemplateService = useMemo(() => ItemTemplateService.getInstance(), [])
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const permissions = useMemo(() => {
        const acl = permissionService.getAcl(me, item, data)
        const canEdit = !data?.core && !!data?.current && acl.canWrite
        return [canEdit]
    }, [data, item, me, permissionService])

    const [canEdit] = permissions
    const columns = useMemo(() => getAttributeColumns(), [])
    const hiddenColumns = useMemo(() => getHiddenAttributeColumns(), [])

    const initialNamedAttributes = useMemo((): NamedAttribute[] => {
        const spec: ItemSpec = data?.spec ?? {}
        const attributes = spec.attributes ?? {}
        let namedAttributes = Object.keys(spec.attributes ?? {})
            .map(attrName => ({name: attrName, ...attributes[attrName]}))
        
        if (item.name !== ITEM_TEMPLATE_ITEM_NAME && namedAttributes.length > 0 && !isNew) {
            const excludedAttrNameSet = new Set()
            for (const itemTemplateName of data.includeTemplates) {
                const itemTemplate = itemTemplateService.getByName(itemTemplateName)
                for (const excludedAttrName in itemTemplate.spec.attributes)
                    excludedAttrNameSet.add(excludedAttrName)
            }
            namedAttributes = namedAttributes.filter(it => !excludedAttrNameSet.has(it.name))
        }
        
        return namedAttributes

    }, [data, isNew, item.name, itemTemplateService])
    const [namedAttributes, setNamedAttributes] = useState<NamedAttribute[]>(initialNamedAttributes)
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedAttribute>>(getInitialData())
    const [selectedAttribute, setSelectedAttribute] = useState<NamedAttribute | null>(null)
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false)
    const [attributeForm] = Form.useForm()

    useEffect(() => {
        // TODO: Save somewhere
    }, [namedAttributes])

    const handleRequest = useCallback(async (params: RequestParams) => {
        setFilteredData(processLocal(namedAttributes, params))
    }, [namedAttributes])
    
    const openRow = useCallback((row: Row<NamedAttribute>) => {
        setSelectedAttribute(row.original)
        setEditModalVisible(true)
    }, [])

    const handleRowDoubleClick = useCallback(async (row: Row<NamedAttribute>) => {
        openRow(row)
    }, [openRow])

    const parseValues = useCallback((values: NamedAttribute): NamedAttribute => {
        const parsedValues: any = {}
        _.forOwn(values, (value, key) => {
            if (value == null)
                return

            if (key === 'enumSet') {
                parsedValues[key] = (value as string).split('\n')
                return
            }

            parsedValues[key] = value
        })

        return parsedValues
    }, [])

    const refresh = () => setVersion(prevVersion => prevVersion + 1)

    const handleAttributeFormFinish = useCallback((values: NamedAttribute) => {
        const parsedValues = parseValues(values)
        const {name} = parsedValues
        if (!name)
            throw new Error('Illegal attribute')

        if (name in (data?.spec?.attributes ?? {}))
            setNamedAttributes(prevNamedAttributes => prevNamedAttributes.map(it => it.name === name ? {...parsedValues} : it))
        else
            setNamedAttributes([...namedAttributes, {...parsedValues}])

        refresh()
        setEditModalVisible(false)
    }, [data?.spec?.attributes, namedAttributes, parseValues])

    const handleCreate = useCallback(() => {
        setSelectedAttribute(null)
        setEditModalVisible(true)
    }, [])

    const renderToolbar = useCallback(() => {
        return (
            <Space>
                {canEdit && <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>}
            </Space>
        )
    }, [canEdit, handleCreate, t])

    const deleteRow = useCallback((row: Row<NamedAttribute>) => {
        setNamedAttributes(prevNamedAttributes => prevNamedAttributes.filter(it => it.name !== row.original.name))
        refresh()
    }, [])

    const getRowContextMenu = useCallback((row: Row<NamedAttribute>) => {
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

        return <Menu items={items}/>
    }, [t, canEdit, openRow])
    
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
                getRowContextMenu={getRowContextMenu}
                onRequest={handleRequest}
                onRowDoubleClick={handleRowDoubleClick}
            />
            <Modal
                title={t('Attribute')}
                visible={isEditModalVisible}
                destroyOnClose
                width={EDIT_MODAL_WIDTH}
                onOk={() => attributeForm.submit()}
                onCancel={() => setEditModalVisible(false)}
            >
                <AttributeForm form={attributeForm} attribute={selectedAttribute} canEdit={canEdit} onFormFinish={handleAttributeFormFinish}/>
            </Modal>
        </>
    )
}