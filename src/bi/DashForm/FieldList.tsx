import _ from 'lodash'
import {ChangeEvent, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Input, Space} from 'antd'
import {PlusOutlined} from '@ant-design/icons'

import {Dataset, IDash, NamedColumn} from 'src/types/bi'
import FieldItem from './FieldItem'
import styles from './FieldList.module.css'

interface FieldListProps {
    dataset: Dataset
    dash: IDash
    canEdit: boolean
    onFieldAdd: () => void
    onFieldOpen: (field: NamedColumn) => void
    onFieldRemove: (fieldName: string) => void
}

const DEBOUNCE_WAIT_INTERVAL = 500

export default function FieldList({dataset, dash, canEdit, onFieldAdd, onFieldOpen, onFieldRemove}: FieldListProps) {
  const {t} = useTranslation()
  const [q, setQ] = useState<string>()
  const filteredDatasetFieldNames = useMemo(
    () => Object.keys(dataset.spec.columns)
      .filter(fieldName => !q || fieldName.toLowerCase().includes(q.toLowerCase()))
      .sort(),
    [dataset.spec.columns, q]
  )
  const filteredDashFieldNames = useMemo(
    () => Object.keys(dash.fields)
      .filter(fieldName => !q || fieldName.toLowerCase().includes(q.toLowerCase()))
      .sort(),
    [dash.fields, q]
  )

  const handleFilter = _.debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value)
  }, DEBOUNCE_WAIT_INTERVAL)

  return (
    <div>
      <Space className={styles.filterInput} size={4}>
        <Input
          allowClear
          placeholder={t('Field name')} size="small"
          onChange={handleFilter}
        />
        <Button
          icon={<PlusOutlined/>}
          title={t('Add')}
          onClick={onFieldAdd}
        />
      </Space>
      <div className={styles.datasetFields}>
        {filteredDatasetFieldNames
          .filter(fieldName => {
            const field = dataset.spec.columns[fieldName]
            return !field.custom || (!field.source && !field.aggregate && !field.formula)
          })
          .map(fieldName => {
            const field = dataset.spec.columns[fieldName]
            return (
              <FieldItem
                key={fieldName}
                field={{...field, name: fieldName}}
                isDatasetField
                canEdit={false}
                onFieldOpen={onFieldOpen}
                onFieldRemove={onFieldRemove}
              />
            )
          })
        }

        {filteredDatasetFieldNames
          .filter(fieldName => {
            const field = dataset.spec.columns[fieldName]
            return field.custom && ((field.source && field.aggregate) || field.formula)
          })
          .map(fieldName => {
            const field = dataset.spec.columns[fieldName]
            return (
              <FieldItem
                key={fieldName}
                field={{...field, name: fieldName}}
                isDatasetField
                canEdit={false}
                onFieldOpen={onFieldOpen}
                onFieldRemove={onFieldRemove}
              />
            )
          })
        }

        {filteredDashFieldNames.map(fieldName => {
          const field = dash.fields[fieldName]
          return (
            <FieldItem
              key={fieldName}
              field={{...field, name: fieldName}}
              isDatasetField={false}
              canEdit={canEdit && dash.fields.hasOwnProperty(fieldName)}
              onFieldOpen={onFieldOpen}
              onFieldRemove={onFieldRemove}
            />
          )
        })}
      </div>
    </div>
  )
}