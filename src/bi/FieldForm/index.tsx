import _ from 'lodash'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Checkbox, Form, Input, InputNumber, Select, Tabs} from 'antd'
import {FormInstance, RuleObject, RuleRender} from 'rc-field-form/es/interface'

import {NamedColumn} from 'src/types/bi'
import {usePrevious} from 'src/util/hooks'
import {regExpRule, requiredFieldRule} from 'src/util/form'
import {
  calculateAggregationResultType,
  datasetFieldTypeOptions,
  getAggregateOptions,
  getFormatOptions
} from 'src/bi/util'
import {AggregateType, Column} from 'src/types/bi'
import {FieldType} from 'src/types'
import FieldTypeIcon from 'src/components/FieldTypeIcon'
import FieldName from 'src/components/FieldName'
import CodeEditor from 'src/uiKit/Editor'
import {EditorMode} from 'src/uiKit/Editor/constants'
import {LETTER_NO_WHITESPACE_PATTERN} from 'src/config/constants'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import styles from './FieldForm.module.css'

interface ColumnFormProps {
  field: NamedColumn
  allFields: Record<string, Column>
  canEdit: boolean
}

export default function FieldForm({field, allFields, canEdit}: ColumnFormProps) {
  const prevField = usePrevious(field)
  const form = Form.useFormInstance()
  const {t} = useTranslation()
  const [source, setSource] = useState<string | undefined>(field.source)
  const [fieldType, setFieldType] = useState<FieldType | undefined>(field.type)
  const [formula, setFormula] = useState<string | undefined>(field.formula)
  const ownFields = _.pickBy(allFields, c => !c.custom)

  useEffect(() => {
    if (field.name !== prevField?.name) form.resetFields()
  }, [field])

  const uniqueNameRule: RuleRender = ({getFieldValue}: FormInstance): RuleObject => ({
    validator(_, value) {
      if (value === field.name || !allFields.hasOwnProperty(value)) return Promise.resolve()

      return Promise.reject(new Error(t('Name is not unique')))
    }
  })

  function handleSourceChange(newSource?: string) {
    setSource(newSource)
    form.setFieldValue('aggregate', undefined)
    form.setFieldValue('format', undefined)

    if (newSource) {
      const sourceColumn = ownFields[newSource]
      form.setFieldValue('type', sourceColumn.type)
      setFieldType(sourceColumn.type)
    } else {
      form.setFieldValue('type', undefined)
      setFieldType(undefined)
    }
  }

  function handleAggregateChange(newAggregate?: AggregateType) {
    if (!source) throw new Error('Illegal state. Source must be specified')

    const sourceColumn = ownFields[source]
    const newFieldType = newAggregate
      ? calculateAggregationResultType(sourceColumn.type, newAggregate)
      : sourceColumn.type
    form.setFieldValue('type', newFieldType)
    setFieldType(newFieldType)
    form.setFieldValue('format', undefined)
  }

  function handleFormulaChange(newFormula: string | undefined) {
    // TODO: Infer type from expression
    form.setFieldValue('formula', newFormula)
  }

  function handleTabsChange(newActiveKey: string) {
    if (!canEdit || !field.custom) return

    form.setFieldValue('type', undefined)
    setFieldType(undefined)
    form.setFieldValue('format', undefined)

    if (newActiveKey === 'source') {
      form.setFieldValue('formula', undefined)
      setFormula('')
    } else if (newActiveKey === 'formula') {
      // TODO: Infer type from expression
      form.setFieldValue('type', FieldType.decimal)
      setFieldType(FieldType.decimal)
      form.setFieldValue('source', undefined)
      setSource(undefined)
      form.setFieldValue('aggregate', undefined)
    }
  }

  function handleVisibilityChange(e: CheckboxChangeEvent) {
    form.setFieldValue('hidden', !e.target.checked)
  }

  return (
    <>
      <Form.Item
        name="name"
        label={t('Name')}
        rules={[requiredFieldRule(), regExpRule(LETTER_NO_WHITESPACE_PATTERN), uniqueNameRule]}
      >
        <Input disabled={!canEdit || !field.custom} />
      </Form.Item>

      <Form.Item
        name="type"
        label={t('Type')}
        rules={[{required: true, message: t('Cannot resolve type. Eihther Source or Formula field must be set.')}]}
      >
        <Select disabled options={datasetFieldTypeOptions} />
      </Form.Item>

      <Tabs
        defaultActiveKey={field.formula ? 'formula' : 'source'}
        size="small"
        style={{height: 220}}
        items={[
          {
            key: 'source',
            label: t('Source'),
            children: (
              <>
                <Form.Item name="source" label={t('Source')}>
                  <Select
                    allowClear
                    disabled={!canEdit || !field.custom}
                    options={Object.keys(ownFields)
                      .sort()
                      .map(f => {
                        const ownField = ownFields[f]
                        return {
                          label: (
                            <span className="text-ellipsis">
                              <FieldTypeIcon fieldType={ownField.type} />
                              &nbsp;&nbsp;
                              <FieldName name={f} />
                            </span>
                          ),
                          value: f
                        }
                      })}
                    onSelect={handleSourceChange}
                    onClear={() => handleSourceChange(undefined)}
                  />
                </Form.Item>

                <Form.Item name="aggregate" label={t('Aggregate')}>
                  <Select
                    allowClear
                    disabled={!canEdit || !field.custom || !source}
                    options={getAggregateOptions(fieldType)}
                    onSelect={handleAggregateChange}
                    onClear={() => handleAggregateChange(undefined)}
                  />
                </Form.Item>
              </>
            )
          },
          {
            key: 'formula',
            label: t('Formula'),
            children: (
              <>
                <Form.Item name="formula" hidden>
                  <Input />
                </Form.Item>

                <div className={styles.formulaEditor}>
                  <CodeEditor
                    value={formula}
                    mode={EditorMode.SQL}
                    height="150px"
                    canEdit={canEdit && field.custom}
                    onChange={handleFormulaChange}
                  />
                </div>
              </>
            )
          }
        ]}
        onChange={handleTabsChange}
      />

      <Form.Item name="hidden" hidden valuePropName="checked">
        <Checkbox disabled={!canEdit}>{t('Hide')}</Checkbox>
      </Form.Item>
      <Checkbox disabled={!canEdit} defaultChecked={!field.hidden} onChange={handleVisibilityChange}>
        {t('Show')}
      </Checkbox>

      <Form.Item name="alias" label={t('Alias')}>
        <Input disabled={!canEdit} />
      </Form.Item>

      <Form.Item name="format" label={t('Format')}>
        <Select allowClear disabled={!canEdit} options={fieldType ? getFormatOptions(fieldType) : []} />
      </Form.Item>

      <Form.Item name="colWidth" label={t('Column Width')}>
        <InputNumber disabled={!canEdit} min={0} />
      </Form.Item>
    </>
  )
}
