import _ from 'lodash'
import {useCallback, useMemo, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Button, Form, Modal, Space} from 'antd'
import {useTranslation} from 'react-i18next'

import {ITEM_ITEM_NAME, ITEM_TEMPLATE_ITEM_NAME} from 'src/config/constants'
import {Index, ItemSpec} from 'src/types/schema'
import {
  type DataWithPagination,
  type RequestParams,
  DataGrid
} from 'src/uiKit/DataGrid'
import {getInitialData, processLocal} from 'src/util/datagrid'
import {DeleteTwoTone, FolderOpenOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import IndexForm from './IndexForm'
import {useAppProperties, useItemAcl, useRegistry} from 'src/util/hooks'
import {getHiddenIndexColumns, getIndexColumns} from './indexColumns'
import {NamedIndex} from './types'
import {CustomComponentContext} from 'src/extensions/plugins/types'

export function Indexes({data: dataWrapper, buffer, onBufferChange}: CustomComponentContext) {
  const {item, data} = dataWrapper
  if (item.name !== ITEM_TEMPLATE_ITEM_NAME && item.name !== ITEM_ITEM_NAME)
    throw new Error('Illegal argument')

  const {itemTemplates} = useRegistry()
  const isNew = !data?.id
  const {t} = useTranslation()
  const appProps = useAppProperties()
  const defaultColWidth = appProps.ui.dataGrid.colWidth
  const {defaultPageSize, minPageSize, maxPageSize} = appProps.query
  const [version, setVersion] = useState<number>(0)
  const acl = useItemAcl(item, data)
  const columns = useMemo(() => getIndexColumns(defaultColWidth), [defaultColWidth])
  const hiddenColumns = useMemo(() => getHiddenIndexColumns(), [])
  const spec: ItemSpec = useMemo(() => buffer.spec ?? data?.spec ?? {}, [buffer.spec, data?.spec])

  const initialNamedIndexes = useMemo((): NamedIndex[] => {
    const indexes = spec.indexes ?? {}
    let namedIndexes = Object.keys(indexes)
      .map(indexName => ({name: indexName, ...indexes[indexName]}))

    if (item.name !== ITEM_TEMPLATE_ITEM_NAME && namedIndexes.length > 0 && !isNew) {
      const excludedIndexNameSet = new Set()
      for (const itemTemplateName of data.includeTemplates) {
        const itemTemplate = itemTemplates[itemTemplateName]
        for (const excludedIndexName in itemTemplate.spec.indexes)
          excludedIndexNameSet.add(excludedIndexName)
      }
      namedIndexes = namedIndexes.filter(it => !excludedIndexNameSet.has(it.name))
    }

    return namedIndexes

  }, [data?.includeTemplates, isNew, item.name, itemTemplates, spec.indexes])
  const [namedIndexes, setNamedIndexes] = useState<NamedIndex[]>(initialNamedIndexes)
  const [filteredData, setFilteredData] = useState<DataWithPagination<NamedIndex>>(getInitialData(defaultPageSize))
  const [selectedIndex, setSelectedIndex] = useState<NamedIndex | null>(null)
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false)
  const [indexForm] = Form.useForm()

  const handleNamedIndexesChange = useCallback((newNamedIndexes: NamedIndex[]) => {
    setNamedIndexes(newNamedIndexes)
    const newIndexes: {[name: string]: Index} = {}
    newNamedIndexes.forEach(it => {
      const newIndex: any = {...it}
      newIndexes[it.name] = newIndex
      delete newIndex.name
    })

    const newSpec = {
      indexes: newIndexes
    }

    onBufferChange({spec: newSpec})
  }, [onBufferChange])

  const handleRequest = useCallback(async (params: RequestParams) => {
    setFilteredData(processLocal({data: namedIndexes, params, minPageSize, maxPageSize}))
  }, [namedIndexes, minPageSize, maxPageSize])

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
    if (!acl.canWrite)
      return

    const parsedValues = parseValues(values)
    const {name} = parsedValues
    if (!name)
      throw new Error('Illegal argument')

    if (name in (spec.indexes ?? {}))
      handleNamedIndexesChange(namedIndexes.map(it => it.name === name ? {...parsedValues} : it))
    else
      handleNamedIndexesChange([...namedIndexes, {...parsedValues}])

    refresh()
    setEditModalVisible(false)
  }, [acl.canWrite, handleNamedIndexesChange, namedIndexes, parseValues, spec.indexes])

  const handleCreate = useCallback(() => {
    setSelectedIndex(null)
    setEditModalVisible(true)
  }, [])

  const renderToolbar = useCallback(() => {
    return (
      <Space>
        {acl.canWrite && <Button type="primary" size="small" icon={<PlusCircleOutlined/>} onClick={handleCreate}>{t('Add')}</Button>}
      </Space>
    )
  }, [acl.canWrite, handleCreate, t])

  const deleteRow = useCallback((row: Row<NamedIndex>) => {
    handleNamedIndexesChange(namedIndexes.filter(it => it.name !== row.original.name))
    refresh()
  }, [handleNamedIndexesChange, namedIndexes])

  const getRowContextMenu = useCallback((row: Row<NamedIndex>) => {
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
          pageSize: appProps.query.defaultPageSize
        }}
        toolbar={renderToolbar()}
        version={version}
        title={t('Indexes')}
        getRowId={originalRow => originalRow.name}
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
        <IndexForm form={indexForm} index={selectedIndex} canEdit={acl.canWrite} onFormFinish={handleIndexFormFinish}/>
      </Modal>
    </>
  )
}