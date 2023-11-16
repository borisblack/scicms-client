import _ from 'lodash'
import {useCallback, useMemo, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, Form, Modal, Space} from 'antd'
import {useTranslation} from 'react-i18next'

import {CustomComponentRenderContext} from '../../index'
import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME} from '../../../../config/constants'
import {Attribute, ItemSpec} from '../../../../types'
import DataGrid, {DataWithPagination, RequestParams} from '../../../../components/datagrid/DataGrid'
import appConfig from '../../../../config'
import {
    getAttributeColumns,
    getHiddenAttributeColumns,
    getInitialData,
    NamedAttribute,
    processLocal
} from '../../../../util/datagrid'
import AttributeForm from './AttributeForm'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import {useItemAcl} from '../../../../util/hooks'

const EDIT_MODAL_WIDTH = 800

export default function Attributes({
    me, itemTemplates, items: itemMap, permissions: permissionMap, item, data, buffer, onBufferChange
}: CustomComponentRenderContext) {
    if (item.name !== ITEM_TEMPLATE_ITEM_NAME && item.name !== ITEM_ITEM_NAME)
        throw new Error('Illegal argument')

    const isNew = !data?.id
    const {t} = useTranslation()
    const [version, setVersion] = useState<number>(0)
    const acl = useItemAcl(me, permissionMap, item, data)
    const columns = useMemo(() => getAttributeColumns(), [])
    const hiddenColumns = useMemo(() => getHiddenAttributeColumns(), [])
    const spec: ItemSpec = useMemo(() => buffer.spec ?? data?.spec ?? {}, [buffer.spec, data?.spec])

    const initialNamedAttributes = useMemo((): NamedAttribute[] => {
        const attributes = spec.attributes ?? {}
        let namedAttributes = Object.keys(attributes)
            .map(attrName => ({name: attrName, ...attributes[attrName]}))

        if (item.name !== ITEM_TEMPLATE_ITEM_NAME && namedAttributes.length > 0 && !isNew) {
            const excludedAttrNameSet = new Set()
            for (const itemTemplateName of data.includeTemplates) {
                const itemTemplate = itemTemplates[itemTemplateName]
                for (const excludedAttrName in itemTemplate.spec.attributes)
                    excludedAttrNameSet.add(excludedAttrName)
            }
            namedAttributes = namedAttributes.filter(it => !excludedAttrNameSet.has(it.name))
        }

        return namedAttributes

    }, [data?.includeTemplates, isNew, item.name, itemTemplates, spec.attributes])
    const [namedAttributes, setNamedAttributes] = useState<NamedAttribute[]>(initialNamedAttributes)
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedAttribute>>(getInitialData())
    const [selectedAttribute, setSelectedAttribute] = useState<NamedAttribute | null>(null)
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false)
    const [attributeForm] = Form.useForm()

    const handleNamedAttributesChange = useCallback((newNamedAttributes: NamedAttribute[]) => {
        setNamedAttributes(newNamedAttributes)
        const newAttributes: {[name: string]: Attribute} = {}
        newNamedAttributes.forEach(it => {
            const newAttribute: any = {...it}
            newAttributes[it.name] = newAttribute
            delete newAttribute.name
        })

        const newSpec = {
            attributes: newAttributes
        }

        onBufferChange({spec: newSpec})
    }, [onBufferChange])

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
        if (!acl.canWrite)
            return

        const parsedValues = parseValues(values)
        const {name} = parsedValues
        if (!name)
            throw new Error('Illegal argument')

        if (name in (spec.attributes ?? {}))
            handleNamedAttributesChange(namedAttributes.map(it => it.name === name ? {...parsedValues} : it))
        else
            handleNamedAttributesChange([...namedAttributes, {...parsedValues}])

        refresh()
        setEditModalVisible(false)
    }, [acl.canWrite, handleNamedAttributesChange, namedAttributes, parseValues, spec.attributes])

    const handleCreate = useCallback(() => {
        setSelectedAttribute(null)
        setEditModalVisible(true)
    }, [])

    const renderToolbar = useCallback(() => {
        return (
            <Space>
                {acl.canWrite && <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>}
            </Space>
        )
    }, [acl.canWrite, handleCreate, t])

    const deleteRow = useCallback((row: Row<NamedAttribute>) => {
        handleNamedAttributesChange(namedAttributes.filter(it => it.name !== row.original.name))
        refresh()
    }, [handleNamedAttributesChange, namedAttributes])

    const getRowContextMenu = useCallback((row: Row<NamedAttribute>) => {
        const items: ItemType[] = [{
            key: 'open',
            label: t('Open'),
            icon: <FolderOpenOutlined/>,
            onClick: () => openRow(row)
        }]

        if (acl.canWrite) {
            items.push({
                key: 'delete',
                label: t('Delete'),
                icon: <DeleteTwoTone twoToneColor="#eb2f96"/>,
                onClick: () => deleteRow(row)
            })
        }

        return items
    }, [t, acl.canWrite, openRow, deleteRow])

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
                title={t('Attributes')}
                version={version}
                getRowContextMenu={getRowContextMenu}
                onRequest={handleRequest}
                onRowDoubleClick={handleRowDoubleClick}
            />
            <Modal
                title={t('Attribute')}
                open={isEditModalVisible}
                destroyOnClose
                width={EDIT_MODAL_WIDTH}
                onOk={() => attributeForm.submit()}
                onCancel={() => setEditModalVisible(false)}
            >
                <AttributeForm
                    items={itemMap}
                    form={attributeForm}
                    attribute={selectedAttribute}
                    canEdit={acl.canWrite}
                    onFormFinish={handleAttributeFormFinish}
                />
            </Modal>
        </>
    )
}