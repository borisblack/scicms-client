import _ from 'lodash'
import React, {useEffect, useMemo, useState} from 'react'
import {Button, Drawer, Form, Space} from 'antd'

import {fromFormQueryBlock, generateQueryBlock} from './util'
import DashForm, {DashFormValues} from './DashForm'
import {Column, Dashboard, Dataset, IDash, NamedColumn} from '../types/bi'
import {useTranslation} from 'react-i18next'
import {useModal} from '../util/hooks'
import DashFieldModal from './DashFieldModal'

interface DashFormModalProps {
  dash: IDash
  datasetMap: Record<string, Dataset>
  dashboards: Dashboard[]
  open: boolean
  canEdit: boolean
  onChange: (dash: IDash) => void
  onClose: () => void
}

const mapDashValues = (dash: IDash, values: DashFormValues, dataset?: Dataset): IDash => ({
  ...dash,
  name: values.name,
  dataset: values.dataset,
  type: values.type,
  unit: values.unit,
  sortField: values.sortField,
  optValues: values.optValues,
  relatedDashboardId: values.relatedDashboardId,
  refreshIntervalSeconds: values.refreshIntervalSeconds,
  defaultFilters: dataset == null ? generateQueryBlock() : fromFormQueryBlock(dataset, values.defaultFilters)
})

let customFieldCounter: number = 0

export default function DashModal({dash, datasetMap, dashboards, canEdit, open, onChange, onClose}: DashFormModalProps) {
  const {t} = useTranslation()
  const [form] = Form.useForm()
  const [selectedDataset, setSelectedDataset] = useState<Dataset | undefined>(datasetMap[dash.dataset ?? ''])
  const allFields = useMemo(() => ({...selectedDataset?.spec.columns ?? {}, ...dash.fields}), [selectedDataset?.spec.columns, dash.fields])
  const datasetOwnFields = useMemo(() => _.pickBy(allFields, col => !col.custom), [allFields])
  const [fieldToChange, setFieldToChange] = useState<NamedColumn>()
  const {show: showFieldModal, close: closeFieldModal, modalProps: fieldModalProps} = useModal()

  function handleDatasetChange(dataset?: Dataset) {
    // if (selectedDataset?.name != null && selectedDataset?.name !== dataset?.name) {
    //     onChange({
    //         ...dash,
    //         fields: {}
    //     })
    // }

    setSelectedDataset(dataset)
  }

  function handleFormFinish(values: DashFormValues) {
    const dataset = values.dataset ? datasetMap[values.dataset] : null
    if (dataset == null)
      return

    onChange(mapDashValues(dash, values, dataset))
    onClose()
  }

  function cancelEdit() {
    form.resetFields()
    onClose()
  }

  function createDraftField() {
    if (!canEdit)
      return

    const datasetOwnColNames = Object.keys(datasetOwnFields).sort()
    if (datasetOwnColNames.length === 0)
      return

    const firstOwnColName = datasetOwnColNames[0]
    const firstOwnColumn = datasetOwnFields[firstOwnColName]
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
    setFieldToChange(newField)
    showFieldModal()
  }

  function handleFieldOpen(field: NamedColumn) {
    setFieldToChange(field)
    showFieldModal()
  }

  const canFieldEdit = (fieldName: string) =>
    !allFields.hasOwnProperty(fieldName) || dash.fields.hasOwnProperty(fieldName)

  function handleFieldChange(field: NamedColumn, prevName: string) {
    if (!canEdit)
      return

    if (!canFieldEdit(prevName))
      throw new Error('Dataset field cannot be changed here.')

    const newFields: Record<string, Column> = {
      ...dash.fields,
      [field.name]: field
    }

    if (prevName !== field.name && dash.fields.hasOwnProperty(prevName)) {
      delete newFields[prevName]
    }

    onChange({
      ...dash,
      fields: newFields
    })
  }

  function handleFieldRemove(fieldName: string) {
    if (!canEdit)
      return

    if (!canFieldEdit(fieldName))
      throw new Error('Dataset field cannot be removed here.')

    onChange({
      ...dash,
      fields: _.omit(dash.fields, fieldName)
    })
  }

  return (
    <Drawer
      className="no-drag"
      title={dash.name}
      open={open}
      destroyOnClose
      width="70%"
      // onOk={() => dashForm.submit()}
      extra={
        <Space>
          <Button onClick={cancelEdit}>{t('Cancel')}</Button>
          <Button disabled={!canEdit} type="primary" onClick={() => form.submit()}>OK</Button>
        </Space>
      }
      onClose={onClose}
    >
      <Form
        form={form}
        size="small"
        layout="vertical"
        disabled={!canEdit}
        onFinish={handleFormFinish}
      >
        <DashForm
          dash={dash}
          datasetMap={datasetMap}
          dashboards={dashboards}
          canEdit={canEdit}
          onDatasetChange={handleDatasetChange}
          onFieldAdd={createDraftField}
          onFieldOpen={handleFieldOpen}
          onFieldRemove={handleFieldRemove}
        />
      </Form>

      {fieldToChange && (
        <DashFieldModal
          {...fieldModalProps}
          field={fieldToChange}
          allFields={allFields}
          canEdit={canEdit && canFieldEdit(fieldToChange.name)}
          onChange={handleFieldChange}
          onClose={closeFieldModal}
        />
      )}
    </Drawer>
  )
}