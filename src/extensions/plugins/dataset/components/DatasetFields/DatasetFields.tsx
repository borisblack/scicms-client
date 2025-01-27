import _ from 'lodash'
import {useEffect, useMemo, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {useTranslation} from 'react-i18next'
import {Button, Space, Typography} from 'antd'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import {DeleteTwoTone, PlusCircleOutlined} from '@ant-design/icons'

import {Split} from 'src/uiKit/Split'
import {DATASET_ITEM_NAME} from 'src/config/constants'
import {type DataWithPagination, type RequestParams, DataGrid} from 'src/uiKit/DataGrid'
import {getInitialData, processLocal} from 'src/util/datagrid'
import {Column, Dataset, DatasetSpec} from 'src/types/bi'
import {NamedColumn} from 'src/types/bi'
import {getColumns} from './fieldsDatagrid'
import {useAcl, useAppProperties} from 'src/util/hooks'
import DataPreview from './DataPreview'
import DatasetFieldModal from './DatasetFieldModal'
import {CustomComponentContext} from 'src/extensions/plugins/types'

const MIN_TOP_PANE_SIZE = 400
const MIN_BOTTOM_PANE_SIZE = 400

const {Title} = Typography

const toNamedFields = (fields: Record<string, Column>): NamedColumn[] =>
  Object.keys(fields).map(colName => ({name: colName, ...fields[colName]}))

let customFieldCounter: number = 0

export function DatasetFields({data: dataWrapper, buffer, onBufferChange}: CustomComponentContext) {
  const data = dataWrapper.data as Dataset | undefined
  const {item} = dataWrapper
  if (item.name !== DATASET_ITEM_NAME) throw new Error('Illegal argument')

  const {t} = useTranslation()
  const appProps = useAppProperties()
  const splitConfig = appProps.ui.split
  const {defaultPageSize, minPageSize, maxPageSize} = appProps.query
  const acl = useAcl(item, data)
  const spec: DatasetSpec = useMemo(() => buffer.spec ?? {}, [buffer])
  const allFields = useMemo(() => spec.columns ?? {}, [spec])
  const ownFields = useMemo(() => _.pickBy(allFields, col => !col.custom), [allFields])
  const [namedFields, setNamedFields] = useState(toNamedFields(allFields))
  const [filteredData, setFilteredData] = useState<DataWithPagination<NamedColumn>>(getInitialData(defaultPageSize))
  const [version, setVersion] = useState<number>(0)
  const [openFieldModal, setOpenFieldModal] = useState<boolean>(false)
  const [currentField, setCurrentField] = useState<NamedColumn | undefined>()
  const isNew = !data?.id

  useEffect(() => {
    const newSpec = data?.spec ?? ({} as Partial<DatasetSpec>)
    setNamedFields(toNamedFields(newSpec.columns ?? {}))
    onBufferChange({
      spec: newSpec
    })
  }, [data])

  useEffect(() => {
    setVersion(prevVersion => prevVersion + 1)
  }, [namedFields])

  if (isNew) return null

  const handleRequest = (params: RequestParams) => {
    setFilteredData(processLocal({data: namedFields, params, minPageSize, maxPageSize}))
  }

  function handleFieldChange(updatedField: NamedColumn, prevName: string) {
    if (!acl.canWrite) return

    const newNamedFields = allFields.hasOwnProperty(prevName)
      ? namedFields.map(f => (f.name === prevName ? updatedField : f))
      : [updatedField, ...namedFields]

    setNamedFields(newNamedFields)

    const newFields: Record<string, Column> = {}
    for (const nf of newNamedFields) {
      const newField: any = {...nf}
      newFields[nf.name] = newField
      delete newField.name
    }

    onBufferChange({
      ...buffer,
      spec: {
        ...spec,
        columns: newFields
      }
    })
  }

  function createDraft() {
    if (!acl.canWrite) return

    const ownColNames = Object.keys(ownFields).sort()
    if (ownColNames.length === 0) return

    const firstOwnColName = ownColNames[0]
    const firstOwnColumn = ownFields[firstOwnColName]
    const newField: NamedColumn = {
      name: `${firstOwnColName}${++customFieldCounter}`,
      type: firstOwnColumn.type,
      custom: true,
      source: firstOwnColName,
      aggregate: undefined,
      formula: undefined,
      hidden: false,
      alias: undefined,
      format: undefined,
      colWidth: undefined
    }
    setCurrentField(newField)
    setOpenFieldModal(true)
  }

  function handleFieldEdit(fieldName: string) {
    if (!allFields.hasOwnProperty(fieldName)) throw new Error(`Field [${fieldName}] not found`)

    const field = allFields[fieldName]
    setCurrentField({...field, name: fieldName})
    setOpenFieldModal(true)
  }

  const renderToolbar = () => (
    <Space size={10}>
      <Title level={5} style={{display: 'inline'}}>
        {t('Fields')}
      </Title>
      {acl.canWrite && !_.isEmpty(ownFields) && (
        <Button type="primary" size="small" icon={<PlusCircleOutlined />} onClick={createDraft}>
          {t('Add')}
        </Button>
      )}
    </Space>
  )

  function getRowContextMenu(row: Row<NamedColumn>): ItemType[] {
    const items: ItemType[] = []

    if (acl.canWrite && !ownFields.hasOwnProperty(row.original.name)) {
      items.push({
        key: 'delete',
        label: t('Delete'),
        icon: <DeleteTwoTone twoToneColor="#eb2f96" />,
        onClick: () => removeField(row.original.name)
      })
    }

    return items
  }

  function removeField(name: string) {
    if (!acl.canWrite || ownFields.hasOwnProperty(name)) return

    const newNamedFields = namedFields.filter(nf => nf.name !== name)

    setNamedFields(newNamedFields)

    const newFields: Record<string, Column> = {}
    for (const nf of newNamedFields) {
      newFields[nf.name] = _.omit(nf, 'name')
    }

    onBufferChange({
      ...buffer,
      spec: {
        ...spec,
        columns: newFields
      }
    })
  }

  const gridColumns = getColumns({
    ownColumns: ownFields,
    canEdit: acl.canWrite,
    defaultColWidth: appProps.ui.dataGrid.colWidth,
    onClick: handleFieldEdit,
    onChange: handleFieldChange
  })

  return (
    <>
      <Split
        horizontal
        minPrimarySize={`${MIN_TOP_PANE_SIZE}px`}
        initialPrimarySize={`${MIN_TOP_PANE_SIZE}px`}
        minSecondarySize={`${MIN_BOTTOM_PANE_SIZE}px`}
        defaultSplitterColors={splitConfig.defaultSplitterColors}
        splitterSize={splitConfig.splitterSize}
        resetOnDoubleClick
      >
        <div style={{height: MIN_TOP_PANE_SIZE}}>
          <DataGrid
            columns={gridColumns}
            data={filteredData}
            initialState={{
              hiddenColumns: [],
              pageSize: appProps.query.defaultPageSize
            }}
            title={t('Fields')}
            height={MIN_TOP_PANE_SIZE}
            toolbar={renderToolbar()}
            version={version}
            getRowId={(row: NamedColumn) => row.name}
            getRowContextMenu={getRowContextMenu}
            onRequest={handleRequest}
          />
        </div>

        <div style={{padding: 16}}>
          <DataPreview dataset={data} allFields={allFields} height={MIN_BOTTOM_PANE_SIZE} />
        </div>
      </Split>

      {currentField && (
        <DatasetFieldModal
          field={currentField}
          allFields={allFields}
          open={openFieldModal}
          canEdit={acl.canWrite}
          onChange={handleFieldChange}
          onClose={() => setOpenFieldModal(false)}
        />
      )}
    </>
  )
}
