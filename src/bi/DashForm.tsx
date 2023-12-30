import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {
    Checkbox,
    Col,
    Collapse,
    Form,
    FormInstance,
    Input,
    InputNumber,
    Popover,
    Row,
    Select,
    Space,
    Tooltip,
    Typography
} from 'antd'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import {ArrowDownOutlined, ArrowUpOutlined, FolderOpenOutlined, QuestionCircleOutlined} from '@ant-design/icons'
import {DefaultOptionType} from 'rc-select/lib/Select'

import {AggregateType, Column, Dataset, IDash, QueryBlock} from '../types/bi'
import {generateQueryBlock, getCustomFunctionsInfo, toFormQueryBlock} from '../util/bi'
import DashFilters from './dash-filters/DashFilters'
import {Dash, getDash, getDashIds} from '../extensions/dashes'
import biConfig from '../config/bi'
import {useBI} from './hooks'
import styles from './DashboardSpec.module.css'

interface DashFormProps {
    dash: IDash
    canEdit: boolean
    datasetMap: Record<string, Dataset>
}

export interface DashFormValues {
    id: string
    name: string
    dataset: string
    type: string
    unit?: string
    isAggregate: boolean
    aggregateType?: AggregateType
    sortField?: string | string[]
    aggregateField?: string
    groupField?: string | string[]
    optValues: any
    defaultFilters: QueryBlock
    relatedDashboardId?: string
    refreshIntervalSeconds: number
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select
const {Link} = Typography
const dashTypes = getDashIds()

export default function DashForm({dash, canEdit, datasetMap}: DashFormProps) {
    const form = Form.useFormInstance()
    const {t} = useTranslation()
    const {dashboards, openDataset} = useBI({withDashboards: true})
    const [dataset, setDataset] = useState<Dataset | undefined>()
    const datasetColumns: {[name: string]: Column} = useMemo(() => dataset?.spec?.columns ?? {}, [dataset?.spec?.columns])
    const allColNames: string[] = useMemo(() => Object.keys(datasetColumns).sort(), [datasetColumns])
    const [isAggregate, setAggregate] = useState<boolean>(dash.isAggregate)
    const [aggregateField, setAggregateField] = useState<string | undefined>(dash.aggregateField)
    const [groupFields, setGroupFields] =
        useState<string[] | undefined>(dash.groupField ? (Array.isArray(dash.groupField) ? dash.groupField : [dash.groupField]) : undefined)

    const availableColNames: string[] = useMemo(() => {
        if (!isAggregate || !aggregateField)
            return allColNames

        return groupFields
            ? [aggregateField, ...(groupFields.filter(groupField => groupField !== aggregateField))].sort()
            : [aggregateField]
    }, [aggregateField, allColNames, groupFields, isAggregate])

    const [dashType, setDashType] = useState<string>(dash.type)
    const dashHandler: Dash | undefined = useMemo(() => getDash(dashType), [dashType])

    useEffect(() => {
        form.resetFields()
    }, [dash])

    useEffect(() => {
        setDataset(dash.dataset ? datasetMap[dash.dataset] : undefined)
    }, [dash.dataset, datasetMap])

    const resetAggregateFormFields = useCallback(() => {
        form.setFieldValue('aggregateType', undefined)
        form.setFieldValue('aggregateField', undefined)
        form.setFieldValue('groupField', undefined)
    }, [form])

    const resetSortAndOptValuesFormFields = useCallback(() => {
        form.setFieldValue('sortField', undefined)
        form.setFieldValue('optValues', {})
    }, [form])

    const handleDatasetChange = useCallback((newDataset: string) => {
        resetAggregateFormFields()
        resetSortAndOptValuesFormFields()
        form.setFieldValue('defaultFilters', generateQueryBlock())
        setDataset(datasetMap[newDataset])
    }, [datasetMap, form, resetAggregateFormFields, resetSortAndOptValuesFormFields])

    const handleAggregateChange = useCallback((evt: CheckboxChangeEvent) => {
        resetAggregateFormFields()
        resetSortAndOptValuesFormFields()
        setAggregate(evt.target.checked)
        setAggregateField(undefined)
        setGroupFields(undefined)
    }, [resetAggregateFormFields, resetSortAndOptValuesFormFields])

    const handleAggregateFieldChange = useCallback((newAggregateField: string | undefined) => {
        form.setFieldValue('groupField', undefined)
        resetSortAndOptValuesFormFields()
        setAggregateField(newAggregateField)
        setGroupFields(undefined)
    }, [form, resetSortAndOptValuesFormFields])

    const handleGroupFieldsChange = useCallback((newGroupFields: string[] | undefined) => {
        resetSortAndOptValuesFormFields()
        setGroupFields(newGroupFields)
    }, [resetSortAndOptValuesFormFields])

    const handleDashTypeChange = useCallback((newDashType: string) => {
        // form.setFieldValue('optValues', {})
        setDashType(newDashType)
    }, [])

    const renderDashOptions = () => (
        dataset && dashHandler && dashHandler.renderOptionsForm({
            dataset,
            availableColNames,
            form,
            fieldName: 'optValues',
            values: dash.optValues ?? {}
        })
    )

    const getSortFieldOptions = (): DefaultOptionType[] => {
        return [{
            label: t('Ascending'),
            options: availableColNames.map(colName => ({
                key:`${colName}:asc`,
                label: <span><ArrowUpOutlined/>&nbsp;{colName}</span>,
                value: `${colName}:asc`
            }))
        }, {
            label: t('Descending'),
            options: availableColNames.map(colName => ({
                key: `${colName}:desc`,
                label: <span><ArrowDownOutlined/>&nbsp;{colName}</span>,
                value: `${colName}:desc`
            }))
        }]
    }

    return (
        <>
            <Row gutter={10} style={{marginBottom: 10}}>
                <FormItem name="id" hidden initialValue={dash.id}>
                    <Input/>
                </FormItem>

                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name="name"
                        label={t('Name')}
                        initialValue={dash.name}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Input/>
                    </FormItem>
                </Col>
                <Col span={6}>
                    <FormItem
                        className={styles.formItem}
                        name="dataset"
                        label={(
                            <Space>
                                {t('Dataset')}
                                {dataset && (
                                    <Tooltip key="open" title={t('Open')}>
                                        <Link onClick={() => openDataset(datasetMap[dataset.name].id)}>
                                            <FolderOpenOutlined/>
                                        </Link>
                                    </Tooltip>
                                )}
                            </Space>
                        )}
                        initialValue={dash.dataset}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Select onSelect={handleDatasetChange}>
                            {Object.keys(datasetMap).sort().map(d => <SelectOption key={d} value={d}>{d}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={6}>
                    <FormItem
                        className={styles.formItem}
                        name="unit"
                        label={t('Unit')}
                        initialValue={dash.unit}
                    >
                        <Input/>
                    </FormItem>
                </Col>
            </Row>

            <Collapse
                defaultActiveKey={['queryOptions', 'dashOptions', 'defaultFilters']}
                items={[{
                    key: 'queryOptions',
                    label: t('Query Options'),
                    children: (
                        <Row gutter={10}>
                            <Col span={6}>
                                <FormItem
                                    className={styles.formItem}
                                    name="isAggregate"
                                    initialValue={isAggregate}
                                    valuePropName="checked"
                                >
                                    <Checkbox
                                        checked={isAggregate}
                                        onChange={handleAggregateChange}
                                        style={{marginTop: 24}}
                                    >
                                        {t('Aggregate')}
                                    </Checkbox>
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem
                                    className={styles.formItem}
                                    name="aggregateType"
                                    label={t('Aggregate Type')}
                                    dependencies={['isAggregate']}
                                    initialValue={dash.aggregateType}
                                    rules={[{required: isAggregate, message: t('Required field')}]}
                                >
                                    <Select disabled={!canEdit || !isAggregate}>
                                        {Object.keys(AggregateType).map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                                    </Select>
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem
                                    className={styles.formItem}
                                    name="aggregateField"
                                    label={t('Aggregate Field')}
                                    dependencies={['isAggregate']}
                                    initialValue={dash.aggregateField}
                                    rules={[{required: isAggregate, message: t('Required field')}]}
                                >
                                    <Select allowClear disabled={!canEdit || !isAggregate} onSelect={handleAggregateFieldChange} onClear={() => handleAggregateFieldChange(undefined)}>
                                        {allColNames.map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)}
                                    </Select>
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem
                                    className={styles.formItem}
                                    name="groupField"
                                    label={t('Group Fields')}
                                    dependencies={['isAggregate']}
                                    initialValue={dash.groupField ? (Array.isArray(dash.groupField) ? dash.groupField : [dash.groupField]) : undefined}
                                >
                                    <Select
                                        allowClear
                                        disabled={!canEdit || !isAggregate}
                                        mode="multiple"
                                        onChange={handleGroupFieldsChange}
                                        onClear={() => handleGroupFieldsChange(undefined)}
                                    >
                                        {allColNames.filter(c => c !== aggregateField).map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)}
                                    </Select>
                                </FormItem>
                            </Col>

                            <Col span={6}>
                                <FormItem
                                    className={styles.formItem}
                                    name="sortField"
                                    label={t('Sort Fields')}
                                    initialValue={dash.sortField ? (Array.isArray(dash.sortField) ? dash.sortField : [dash.sortField]) : undefined}
                                >
                                    <Select
                                        allowClear
                                        mode="multiple"
                                        options={getSortFieldOptions()}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                    )
                }, {
                    key: 'dashOptions',
                    label: t('Dash Options'),
                    children: (
                        <>
                            <Row gutter={10} style={{marginBottom: 10}}>
                                <Col span={6}>
                                    <FormItem
                                        className={styles.formItem}
                                        name="type"
                                        label={t('Type')}
                                        initialValue={dash.type}
                                        rules={[{required: true, message: t('Required field')}]}
                                    >
                                        <Select onSelect={handleDashTypeChange}>
                                            {dashTypes.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                                        </Select>
                                    </FormItem>
                                </Col>

                                <Col span={6}>
                                    <FormItem
                                        className={styles.formItem}
                                        name="relatedDashboardId"
                                        label={t('Related Dashboard')}
                                        initialValue={dash.relatedDashboardId}
                                    >
                                        <Select allowClear>
                                            {dashboards.map(d => <SelectOption key={d.id} value={d.id}>{d.name}</SelectOption>)}
                                        </Select>
                                    </FormItem>
                                </Col>
                            </Row>

                            {renderDashOptions()}
                        </>
                    )
                }, {
                    key: 'defaultFilters',
                    label: (
                        <Space>
                            {t('Default Filters')}
                            <Popover
                                arrow={false}
                                placement="right"
                                overlayInnerStyle={{width: 600}}
                                title={<>{getCustomFunctionsInfo().map((s, i) => <div key={i} style={{fontWeight: 'normal'}}>{s}</div>)}</>}
                            >
                                <QuestionCircleOutlined className="blue"/>
                            </Popover>
                        </Space>
                    ),
                    children: (dataset && (
                        <DashFilters
                            form={form}
                            namePrefix={['defaultFilters']}
                            dataset={dataset}
                            initialBlock={toFormQueryBlock(dataset, dash.defaultFilters)}
                        />
                    ))
                }]}
            />

            <Row gutter={10} style={{marginTop: 16}}>
                <Col span={6}>
                    <FormItem
                        className={styles.formItem}
                        name="refreshIntervalSeconds"
                        label={t('Refresh Interval (sec)')}
                        initialValue={dash.refreshIntervalSeconds}
                        rules={[
                            {required: true, message: t('Required field')},
                            {type: 'number', min: biConfig.minRefreshIntervalSeconds}
                        ]}
                    >
                        <InputNumber style={{width: '50%'}} min={biConfig.minRefreshIntervalSeconds}/>
                    </FormItem>
                </Col>
            </Row>
        </>
    )
}