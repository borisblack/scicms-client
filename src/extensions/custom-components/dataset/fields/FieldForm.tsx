import _ from 'lodash'
import React, {lazy, Suspense, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Checkbox, Form, Input, InputNumber, Select, Space, Tabs} from 'antd'
import {FormInstance, RuleObject, RuleRender} from 'rc-field-form/es/interface'

import {NamedColumn} from './types'
import {usePrevious} from 'src/util/hooks'
import {regExpRule, requiredFieldRule} from 'src/util/form'
import {
    calculateAggregationResultType,
    datasetFieldTypeOptions,
    getAggregateOptions,
    getFormatOptions
} from 'src/bi/util'
import {AggregateType, Column} from 'src/types/bi'
import styles from './FieldForm.module.css'
import {FieldType} from 'src/types'
import FieldTypeIcon from 'src/components/app/FieldTypeIcon'
import FieldName from 'src/components/app/FieldName'

interface ColumnFormProps {
    field: NamedColumn,
    allFields: Record<string, Column>,
    canEdit: boolean
}

const SqlEditor = lazy(() => import('src/components/sql-editor/SqlEditor'))

export default function FieldForm({field, allFields, canEdit}: ColumnFormProps) {
    const prevField = usePrevious(field)
    const form = Form.useFormInstance()
    const {t} = useTranslation()
    const [source, setSource] = useState<string | undefined>(field.source)
    const [fieldType, setFieldType] = useState<FieldType | undefined>(field.type)
    const [formula, setFormula] = useState<string | undefined>(field.formula)
    const ownFields = _.pickBy(allFields, c => !c.custom)

    useEffect(() => {
        if (field.name !== prevField?.name)
            form.resetFields()
    }, [field])

    const uniqueNameRule: RuleRender = ({getFieldValue}: FormInstance): RuleObject => ({
        validator(_, value) {
            if (value === field.name || !allFields.hasOwnProperty(value))
                return Promise.resolve()

            return Promise.reject(new Error(t('Name is not unique')))
        },
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
        if (!source)
            throw new Error('Illegal state. Source must be specified')

        const sourceColumn = ownFields[source]
        const newFieldType = newAggregate ? calculateAggregationResultType(sourceColumn.type, newAggregate) : sourceColumn.type
        form.setFieldValue('type', newFieldType)
        setFieldType(newFieldType)
        form.setFieldValue('format', undefined)
    }

    function handleFormulaChange(newFormula: string | undefined) {
        form.setFieldValue('formula', newFormula)
    }

    function handleTabsChange(newActiveKey: string) {
        if (!canEdit || !field.custom)
            return

        form.setFieldValue('type', undefined)
        setFieldType(undefined)
        form.setFieldValue('format', undefined)

        if (newActiveKey === 'source') {
            form.setFieldValue('formula', undefined)
            setFormula('')
        } else if (newActiveKey === 'formula') {
            form.setFieldValue('source', undefined)
            setSource(undefined)
            form.setFieldValue('aggregate', undefined)
        }
    }

    return (
        <>
            <Form.Item
                name="name"
                label={t('Name')}
                rules={[
                    requiredFieldRule(),
                    regExpRule(/^\w+$/),
                    uniqueNameRule
                ]}
            >
                <Input disabled={!canEdit || !field.custom}/>
            </Form.Item>

            <Form.Item
                name="type"
                label={t('Type')}
                rules={[requiredFieldRule()]}
            >
                <Select
                    disabled={!canEdit || !field.custom || !!source}
                    options={datasetFieldTypeOptions}
                />
            </Form.Item>

            <Tabs
                defaultActiveKey={field.formula ? 'formula' : 'source'}
                size="small"
                style={{height: 220}}
                items={[{
                    key: 'source',
                    label: t('Source'),
                    children: (
                        <>
                            <Form.Item name="source" label={t('Source')}>
                                <Select
                                    allowClear
                                    disabled={!canEdit || !field.custom}
                                    options={Object.keys(ownFields).sort().map(f => {
                                        const ownField = ownFields[f]
                                        return {
                                            label: (
                                                <span>
                                                    <FieldTypeIcon fieldType={ownField.type}/>
                                                    &nbsp;
                                                    <FieldName name={f}/>
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
                                    options={getAggregateOptions(field.type)}
                                    onSelect={handleAggregateChange}
                                    onClear={() => handleAggregateChange(undefined)}
                                />
                            </Form.Item>
                        </>
                    )
                }, {
                    key: 'formula',
                    label: t('Formula'),
                    children: (
                        <>
                            <Form.Item name="formula" hidden>
                                <Input/>
                            </Form.Item>

                            <div className={styles.formulaEditor}>
                                <Suspense fallback={null}>
                                    <SqlEditor
                                        value={formula}
                                        height={150}
                                        canEdit={canEdit && field.custom}
                                        onChange={handleFormulaChange}
                                    />
                                </Suspense>
                            </div>
                        </>
                    )
                }]}
                onChange={handleTabsChange}
            />

            <Form.Item name="hidden" valuePropName="checked">
                <Checkbox>{t('Hide')}</Checkbox>
            </Form.Item>

            <Form.Item name="alias" label={t('Alias')}>
                <Input/>
            </Form.Item>

            <Form.Item name="format" label={t('Format')}>
                <Select
                    allowClear
                    options={fieldType ? getFormatOptions(fieldType) : []}
                />
            </Form.Item>

            <Form.Item name="colWidth" label={t('Column Width')}>
                <InputNumber min={0}/>
            </Form.Item>
        </>
    )
}