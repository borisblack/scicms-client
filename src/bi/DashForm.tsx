import {
    Checkbox,
    Col,
    Collapse,
    DatePicker,
    Form,
    FormInstance,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    TimePicker,
    Tooltip
} from 'antd'
import {
    AggregateType,
    Column,
    Dataset,
    FieldType,
    IDash,
    QueryBlock,
    TemporalPeriod,
    TemporalType
} from '../types'
import {useTranslation} from 'react-i18next'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {
    allTemporalPeriods,
    fromFormQueryBlock,
    generateQueryBlock,
    getCustomFunctionsInfo,
    isTemporal,
    temporalPeriodTitles,
    timeTemporalPeriods,
    toFormQueryBlock
} from '../util/bi'
import DatasetService from '../services/dataset'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import dayjs, {Dayjs} from 'dayjs'
import DashOptFieldWrapper from './DashOptFieldWrapper'
import DashFilters from './dash-filters/DashFilters'
import styles from './DashboardSpec.module.css'
import {Dash, getDash, getDashIds} from '../extensions/dashes'
import biConfig from '../config/bi'
import {QuestionCircleOutlined} from '@ant-design/icons'

interface Props {
    form: FormInstance
    dash: IDash
    canEdit: boolean
    onFormFinish: (dash: DashValues) => void
}

export interface DashValues {
    name: string
    dataset: string
    type: string
    unit?: string
    isAggregate: boolean
    aggregateType?: AggregateType
    sortField?: string
    sortDirection?: string
    aggregateField?: string
    groupField?: string
    optValues: any
    defaultFilters: QueryBlock
    temporalField?: string
    defaultPeriod: TemporalPeriod
    defaultStartTemporal?: Dayjs
    defaultEndTemporal?: Dayjs
    refreshIntervalSeconds: number
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select
const {Panel} = Collapse
const dashTypes = getDashIds()
const datasetService = DatasetService.getInstance()

const prepareDashValues = (dashValues: DashValues, dataset?: Dataset): DashValues => ({
    ...dashValues,
    defaultFilters: dataset == null ? generateQueryBlock() : fromFormQueryBlock(dataset, dashValues.defaultFilters)
})

export default function DashForm({form, dash, canEdit, onFormFinish}: Props) {
    const {t} = useTranslation()
    const [datasets, setDatasets] = useState<Dataset[]>([])
    const [dataset, setDataset] = useState<Dataset | undefined>()
    const datasetColumns: {[name: string]: Column} = useMemo(() => dataset?.spec?.columns ?? {}, [dataset?.spec?.columns])
    const allColNames: string[] = useMemo(() => Object.keys(datasetColumns).sort(), [datasetColumns])
    const [isAggregate, setAggregate] = useState<boolean>(dash.isAggregate)
    const [aggregateField, setAggregateField] = useState<string | undefined>(dash.aggregateField)
    const [groupField, setGroupField] = useState<string | undefined>(dash.groupField)
    const availableColNames: string[] = useMemo(() => {
        if (!isAggregate || !aggregateField)
            return allColNames

        return (groupField && groupField !== aggregateField) ? [aggregateField, groupField] : [aggregateField]
    }, [aggregateField, allColNames, groupField, isAggregate])
    const [temporalField, setTemporalField] = useState<string | undefined>(dash.temporalField)
    const temporalType: TemporalType | undefined = useMemo(
        () => temporalField ? datasetColumns[temporalField]?.type as TemporalType | undefined : undefined,
        [datasetColumns, temporalField])
    const [defaultPeriod, setDefaultPeriod] = useState<TemporalPeriod | undefined>(dash.defaultPeriod ?? TemporalPeriod.ARBITRARY)
    const [dashType, setDashType] = useState<string>(dash.type)
    const dashHandler: Dash | undefined = useMemo(() => getDash(dashType), [dashType])

    useEffect(() => {
        datasetService.findAll()
            .then(datasets => {
                setDatasets(datasets)
                setDataset(datasets.find(d => d.name === dash.dataset))
            })
    }, [dash.dataset])

    const resetAggregateFormFields = useCallback(() => {
        form.setFieldValue('aggregateType', undefined)
        form.setFieldValue('aggregateField', undefined)
        form.setFieldValue('groupField', undefined)
    }, [form])

    const resetSortAndOptValuesFormFields = useCallback(() => {
        form.setFieldValue('sortField', undefined)
        form.setFieldValue('sortDirection', 'asc')
        form.setFieldValue('optValues', {})
        setDefaultPeriod(TemporalPeriod.ARBITRARY)
    }, [form])

    const handleDatasetChange = useCallback((newDataset: string) => {
        resetAggregateFormFields()
        resetSortAndOptValuesFormFields()
        form.setFieldValue('defaultFilters', generateQueryBlock())
        setDataset(datasets.find(d => d.name === newDataset))
    }, [datasets, form, resetAggregateFormFields, resetSortAndOptValuesFormFields])

    const handleTemporalFieldChange = useCallback((newTemporalField: string | undefined) => {
        setTemporalField(newTemporalField)
        setDefaultPeriod(TemporalPeriod.ARBITRARY)
        form.setFieldValue('defaultPeriod', TemporalPeriod.ARBITRARY)
        form.setFieldValue('defaultStartTemporal', undefined)
        form.setFieldValue('defaultEndTemporal', undefined)
    }, [form])

    const handleDefaultPeriod = useCallback((defaultPeriod: TemporalPeriod) => {
        setDefaultPeriod(defaultPeriod)
        form.setFieldValue('defaultStartTemporal', undefined)
        form.setFieldValue('defaultEndTemporal', undefined)
    }, [form])

    const handleAggregateChange = useCallback((evt: CheckboxChangeEvent) => {
        resetAggregateFormFields()
        resetSortAndOptValuesFormFields()
        setAggregate(evt.target.checked)
        setAggregateField(undefined)
        setGroupField(undefined)
    }, [resetAggregateFormFields, resetSortAndOptValuesFormFields])

    const handleAggregateFieldChange = useCallback((newAggregateField: string | undefined) => {
        form.setFieldValue('groupField', undefined)
        resetSortAndOptValuesFormFields()
        setAggregateField(newAggregateField)
        setGroupField(undefined)
    }, [form, resetSortAndOptValuesFormFields])

    const handleGroupFieldChange = useCallback((newGroupField: string | undefined) => {
        resetSortAndOptValuesFormFields()
        setGroupField(newGroupField)
    }, [resetSortAndOptValuesFormFields])

    const handleDashTypeChange = useCallback((newDashType: string) => {
        // form.setFieldValue('optValues', {})
        setDashType(newDashType)
    }, [])

    function renderDashOptions() {
        if (dashHandler == null)
            return null

        const {options, renderOptionsForm} = dashHandler
        if (renderOptionsForm != null)
            return dataset && renderOptionsForm({
                dataset,
                availableColNames,
                form,
                fieldName: 'optValues',
                values: dash.optValues ?? {}
            })

        if (options != null)
            return (
                <Row gutter={10}>
                    {options.map(opt => (
                        <Col key={opt.name} span={6}>
                            <DashOptFieldWrapper
                                dashOpt={opt}
                                availableColumns={availableColNames}
                                initialValue={dash.optValues ? dash.optValues[opt.name] : undefined}
                            />
                        </Col>
                    ))}
                </Row>
            )

        return null
    }

    return (
        <Form
            form={form}
            size="small"
            layout="vertical"
            disabled={!canEdit}
            onFinish={dashValues => onFormFinish(prepareDashValues(dashValues, dataset))}
        >
            <Row gutter={10}>
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
                        label={t('Dataset')}
                        initialValue={dash.dataset}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Select onSelect={handleDatasetChange}>
                            {datasets.map(d => <SelectOption key={d.name} value={d.name}>{d.name}</SelectOption>)}
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

            <Collapse defaultActiveKey={dashHandler ? ['queryOptions', 'dashOptions'] : ['queryOptions']}>
                <Panel header={t('Query Options')} key="queryOptions">
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
                                    style={{marginTop: 24}}>{t('Aggregate')}
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
                                label={t('Group Field')}
                                dependencies={['isAggregate']}
                                initialValue={dash.groupField}
                            >
                                <Select allowClear disabled={!canEdit || !isAggregate} onSelect={handleGroupFieldChange} onClear={() => handleGroupFieldChange(undefined)}>
                                    {allColNames.filter(c => c !== aggregateField).map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)}
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={10}>
                        <Col span={6}>
                            <FormItem
                                className={styles.formItem}
                                name="sortField"
                                label={t('Sort Field')}
                                initialValue={dash.sortField}
                            >
                                <Select allowClear>
                                    {availableColNames.map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)}
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem
                                className={styles.formItem}
                                name="sortDirection"
                                label={t('Sort Direction')}
                                initialValue={dash.sortDirection ?? 'asc'}
                                rules={[{required: true, message: t('Required field')}]}
                            >
                                <Select>
                                    <SelectOption key="asc" value="asc">asc</SelectOption>
                                    <SelectOption key="desc" value="desc">desc</SelectOption>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                </Panel>

                <Panel header={t('Dash Options')} key="dashOptions">
                    <Row gutter={10}>
                        <Col span={8}>
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
                    </Row>

                    {renderDashOptions()}
                </Panel>

                <Panel
                    key="defaultFilters"
                    header={(
                        <Space>
                            {t('Default Filters')}
                            <Tooltip
                                placement="right"
                                overlayInnerStyle={{width: 400}}
                                title={<>{getCustomFunctionsInfo().map((s, i) => <div key={i}>{s}</div>)}</>}
                            >
                                <QuestionCircleOutlined className="blue"/>
                            </Tooltip>
                        </Space>
                    )}
                >
                    <Row gutter={10}>
                        <Col span={6}>
                            <FormItem
                                className={styles.formItem}
                                name="temporalField"
                                label={t('Temporal Field')}
                                initialValue={temporalField}
                            >
                                <Select allowClear onSelect={handleTemporalFieldChange} onClear={() => handleTemporalFieldChange(undefined)}>
                                    {allColNames
                                        .filter(c => {
                                            const datasetColumnType = datasetColumns[c]?.type
                                            if (datasetColumnType == null)
                                                return false

                                            return isTemporal(datasetColumnType)
                                        })
                                        .map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)
                                    }
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem
                                className={styles.formItem}
                                name="defaultPeriod"
                                label={t('Default Period')}
                                initialValue={defaultPeriod}
                            >
                                <Select disabled={!canEdit || !temporalType} onSelect={handleDefaultPeriod}>
                                    {(temporalType === FieldType.time ? timeTemporalPeriods : allTemporalPeriods)
                                        .map(k => <SelectOption key={k} value={k}>{temporalPeriodTitles[k]}</SelectOption>)
                                    }
                                </Select>
                            </FormItem>
                        </Col>

                        {defaultPeriod === TemporalPeriod.ARBITRARY && (
                            <>
                                <Col span={6}>
                                    <FormItem
                                        className={styles.formItem}
                                        name="defaultStartTemporal"
                                        label={t('Default Begin')}
                                        initialValue={dash.defaultStartTemporal == null ? null : dayjs(dash.defaultStartTemporal)}
                                    >
                                        {temporalType === FieldType.time ? (
                                            <TimePicker style={{width: '100%'}} disabled={!canEdit || !temporalType}/>
                                        ) : (
                                            <DatePicker
                                                style={{width: '100%'}}
                                                showTime={temporalType === FieldType.datetime || temporalType === FieldType.timestamp}
                                                disabled={!canEdit || !temporalType}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={6}>
                                    <FormItem
                                        className={styles.formItem}
                                        name="defaultEndTemporal"
                                        label={t('Default End')}
                                        initialValue={dash.defaultEndTemporal == null ? null : dayjs(dash.defaultEndTemporal)}
                                    >
                                        {temporalType === FieldType.time ? (
                                            <TimePicker style={{width: '100%'}} disabled={!canEdit || !temporalType}/>
                                        ) : (
                                            <DatePicker
                                                style={{width: '100%'}}
                                                showTime={temporalType === FieldType.datetime || temporalType === FieldType.timestamp}
                                                disabled={!canEdit || !temporalType}
                                            />
                                        )}

                                    </FormItem>
                                </Col>
                            </>
                        )}
                    </Row>

                    {dataset && (
                        <DashFilters
                            form={form}
                            namePrefix={['defaultFilters']}
                            dataset={dataset}
                            initialBlock={toFormQueryBlock(dataset, dash.defaultFilters)}
                        />
                    )}
                </Panel>
            </Collapse>

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
        </Form>
    )
}