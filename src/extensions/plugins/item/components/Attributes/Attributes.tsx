import _ from 'lodash'
import {useCallback, useMemo, useRef, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, Form, Modal, Space} from 'antd'
import {useTranslation} from 'react-i18next'

import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME} from 'src/config/constants'
import {Attribute, ItemSpec} from 'src/types/schema'
import {type DataWithPagination, type RequestParams, DataGrid} from 'src/uiKit/DataGrid/DataGrid'
import {processLocal} from 'src/util/datagrid'
import AttributeForm from './AttributeForm'
import {CopyOutlined, DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import {useAppProperties, useItemAcl, useModal, useRegistry} from 'src/util/hooks'
import {getAttributeColumns, getHiddenAttributeColumns} from './attributeColumns'
import {NamedAttribute} from './types'
import {CustomComponentContext} from 'src/extensions/plugins/types'
import {DragEndEvent} from '@dnd-kit/core'
import {arrayMove} from '@dnd-kit/sortable'
import {sortAttributes} from 'src/util/schema'
import TemplateAttributesSelection from './TemplateAttributesSelection'

const EDIT_MODAL_WIDTH = 800
const DEFAULT_PAGE_SIZE = 100

const getInitialAttributesData: () => DataWithPagination<NamedAttribute> = () => ({
  data: [],
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  }
})

export function Attributes({itemTab: dataWrapper, form, buffer, onBufferChange}: CustomComponentContext) {
  const {item, data} = dataWrapper
  if (item.name !== ITEM_TEMPLATE_ITEM_NAME && item.name !== ITEM_ITEM_NAME) throw new Error('Illegal argument')

  const {itemTemplates} = useRegistry()
  const isNew = !data?.id
  const {t} = useTranslation()
  const appProps = useAppProperties()
  const defaultColWidth = appProps.ui.dataGrid.colWidth
  const {minPageSize, maxPageSize} = appProps.query
  const [version, setVersion] = useState<number>(0)
  const acl = useItemAcl(item, data)
  const isCoreItem = useMemo(() => data?.core ?? false, [data?.core])
  const columns = useMemo(() => getAttributeColumns(isCoreItem, defaultColWidth), [isCoreItem, defaultColWidth])
  const hiddenColumns = useMemo(() => getHiddenAttributeColumns(), [])
  const spec: ItemSpec = useMemo(() => buffer.spec ?? data?.spec ?? {}, [buffer.spec, data?.spec])
  const includeTemplates: string[] | undefined = Form.useWatch('includeTemplates', form)

  const initialNamedAttributes = useMemo((): NamedAttribute[] => {
    const attributes = sortAttributes(spec.attributes ?? {})
    const excludedAttrNames = new Set(
      (includeTemplates ?? [])
        .map(templateName => itemTemplates[templateName])
        .flatMap(template => Object.keys(template.spec.attributes))
    )
    const namedAttributes = Object.keys(attributes)
      .map((attrName, i) => ({name: attrName, sortOrder: i + 1, ...attributes[attrName]}))
      .filter(attr => !excludedAttrNames.has(attr.name))

    return namedAttributes
  }, [itemTemplates, includeTemplates, spec.attributes])
  const [namedAttributes, setNamedAttributes] = useState<NamedAttribute[]>(initialNamedAttributes)
  const [filteredData, setFilteredData] = useState<DataWithPagination<NamedAttribute>>(getInitialAttributesData())
  const [selectedAttribute, setSelectedAttribute] = useState<NamedAttribute | null>(null)
  const {
    show: showTemplateAttributesModal,
    close: closeTemplateAttributesModal,
    modalProps: templateAttributesModalProps
  } = useModal()
  const templateAttributes = useRef<NamedAttribute[]>([])
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false)
  const [attributeForm] = Form.useForm()

  const handleNamedAttributesChange = useCallback(
    (newNamedAttributes: NamedAttribute[]) => {
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
    },
    [onBufferChange]
  )

  const handleRequest = useCallback(
    async (params: RequestParams) => {
      setFilteredData(processLocal({data: namedAttributes, params, minPageSize, maxPageSize}))
    },
    [namedAttributes, minPageSize, maxPageSize]
  )

  const openRow = useCallback((row: Row<NamedAttribute>) => {
    setSelectedAttribute(row.original)
    setEditModalVisible(true)
  }, [])

  const handleRowDoubleClick = useCallback(
    async (row: Row<NamedAttribute>) => {
      openRow(row)
    },
    [openRow]
  )

  const parseValues = useCallback((values: NamedAttribute): NamedAttribute => {
    const parsedValues: any = {}
    _.forOwn(values, (value, key) => {
      if (value == null) return

      if (key === 'enumSet') {
        parsedValues[key] = (value as string).split('\n')
        return
      }

      parsedValues[key] = value
    })

    return parsedValues
  }, [])

  const refresh = () => setVersion(prevVersion => prevVersion + 1)

  const handleAttributeFormFinish = useCallback(
    (values: NamedAttribute) => {
      if (!acl.canWrite) return

      const parsedValues = parseValues(values)
      const {name} = parsedValues
      if (!name) throw new Error('Illegal argument')

      if (name in (spec.attributes ?? {}))
        handleNamedAttributesChange(namedAttributes.map(it => (it.name === name ? {...parsedValues} : it)))
      else handleNamedAttributesChange([...namedAttributes, {...parsedValues}])

      refresh()
      setEditModalVisible(false)
    },
    [acl.canWrite, handleNamedAttributesChange, namedAttributes, parseValues, spec.attributes]
  )

  const handleCreate = useCallback(() => {
    setSelectedAttribute(null)
    setEditModalVisible(true)
  }, [])

  const renderToolbar = useCallback(() => {
    return (
      <Space>
        {acl.canWrite && (
          <Button
            type="primary"
            size="small"
            icon={<PlusCircleOutlined />}
            title={t('Add attribute')}
            onClick={handleCreate}
          >
            {t('Add')}
          </Button>
        )}
        {acl.canWrite && (
          <Button
            size="small"
            icon={<CopyOutlined />}
            title={t('Select attributes from template')}
            onClick={showTemplateAttributesModal}
          >
            {t('From template')}
          </Button>
        )}
      </Space>
    )
  }, [acl.canWrite, handleCreate, showTemplateAttributesModal, t])

  const deleteRow = useCallback(
    (row: Row<NamedAttribute>) => {
      handleNamedAttributesChange(namedAttributes.filter(it => it.name !== row.original.name))
      refresh()
    },
    [handleNamedAttributesChange, namedAttributes]
  )

  const getRowContextMenu = useCallback(
    (row: Row<NamedAttribute>) => {
      const items: ItemType[] = [
        {
          key: 'open',
          label: t('Open'),
          icon: <FolderOpenOutlined />,
          onClick: () => openRow(row)
        }
      ]

      if (acl.canWrite) {
        items.push({
          key: 'delete',
          label: t('Delete'),
          icon: <DeleteTwoTone twoToneColor="#eb2f96" />,
          onClick: () => deleteRow(row)
        })
      }

      return items
    },
    [t, acl.canWrite, openRow, deleteRow]
  )

  const handleRowMove = useCallback(
    (evt: DragEndEvent) => {
      const {active, over} = evt
      if (active && over && active.id !== over.id) {
        const oldIndex = namedAttributes.findIndex(na => na.name === active.id)
        const newIndex = namedAttributes.findIndex(na => na.name === over.id)
        const newNamedAttributes = arrayMove(namedAttributes, oldIndex, newIndex) // this is just a splice util
        newNamedAttributes.forEach((na, i) => (na.sortOrder = i + 1))
        handleNamedAttributesChange(newNamedAttributes)
        setFilteredData({
          data: newNamedAttributes,
          pagination: {
            page: 1,
            pageSize: DEFAULT_PAGE_SIZE,
            total: namedAttributes.length
          }
        })
      }
    },
    [namedAttributes, handleNamedAttributesChange]
  )

  function applyTemplateAttributes() {
    handleNamedAttributesChange([...namedAttributes, ...templateAttributes.current])
    closeTemplateAttributesModal()
    refresh()
  }

  return (
    <>
      <DataGrid
        key={acl.canWrite ? 'writable' : 'readOnly'} // need recreate for correctness of moving rows functionality
        columns={columns}
        data={filteredData}
        initialState={{
          hiddenColumns: hiddenColumns,
          pageSize: DEFAULT_PAGE_SIZE
        }}
        toolbar={renderToolbar()}
        title={t('Attributes')}
        version={version}
        rowDndEnabled={acl.canWrite}
        getRowId={originalRow => originalRow.name}
        getRowContextMenu={getRowContextMenu}
        onRequest={handleRequest}
        onRowDoubleClick={handleRowDoubleClick}
        onRowMove={acl.canWrite ? handleRowMove : undefined}
      />
      <Modal
        {...templateAttributesModalProps}
        title={t('Template attributes')}
        onOk={applyTemplateAttributes}
        onCancel={closeTemplateAttributesModal}
      >
        <TemplateAttributesSelection
          includeTemplates={includeTemplates ?? []}
          existingAttributes={namedAttributes}
          onChange={selectedAttributes => {
            templateAttributes.current = selectedAttributes
          }}
        />
      </Modal>
      <Modal
        title={t('Attribute')}
        open={isEditModalVisible}
        destroyOnClose
        width={EDIT_MODAL_WIDTH}
        onOk={() => attributeForm.submit()}
        onCancel={() => setEditModalVisible(false)}
      >
        <AttributeForm
          form={attributeForm}
          attribute={selectedAttribute}
          canEdit={acl.canWrite}
          onFormFinish={handleAttributeFormFinish}
        />
      </Modal>
    </>
  )
}
