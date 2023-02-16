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
    TimePicker
} from 'antd'
import {
    AggregateType,
    DashType,
    Dataset,
    FieldType,
    IDash,
    MetricType,
    TemporalPeriod,
    TemporalType
} from '../../../types'
import styles from './DashboardSpec.module.css'
import {useTranslation} from 'react-i18next'
import appConfig from '../../../config'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {
    allTemporalPeriods,
    dashTypes,
    metricTypes,
    temporalPeriodTitles,
    temporalTypes,
    timeTemporalPeriods
} from '../../../util/dashboard'
import DatasetService from '../../../services/dataset'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import dayjs, {Dayjs} from 'dayjs'
import {getRenderer} from '../../../dashboard/DashRenderers'
import DashOptFieldWrapper from './DashOptFieldWrapper'
import {DashRenderer} from '../../../dashboard/dashes'

interface Props {
    form: FormInstance
    dash: IDash
    canEdit: boolean
    onFormFinish: (dash: DashValues) => void
}

export interface DashValues {
    name: string
    dataset: string
    type: DashType
    optValues: any
    isAggregate: boolean
    aggregateType?: AggregateType
    sortField?: string
    sortDirection?: string
    aggregateField?: string
    groupField?: string
    metricType?: MetricType
    metricField?: string
    unit?: string
    labelField?: string
    temporalType?: TemporalType
    temporalField?: string
    defaultPeriod: TemporalPeriod
    defaultStartTemporal?: Dayjs
    defaultEndTemporal?: Dayjs
    refreshIntervalSeconds: number
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select
const {Panel} = Collapse
const datasetService = DatasetService.getInstance()

export default function DashForm({form, dash, canEdit, onFormFinish}: Props) {
    const {t} = useTranslation()
    const [datasets, setDatasets] = useState<Dataset[]>([])
    const [dataset, setDataset] = useState<Dataset | undefined>()
    const [isAggregate, setAggregate] = useState<boolean>(dash.isAggregate)
    const [aggregateField, setAggregateField] = useState<string | undefined>(dash.aggregateField)
    const [groupField, setGroupField] = useState<string | undefined>(dash.groupField)
    const [temporalType, setTemporalType] = useState<TemporalType | undefined>(dash.temporalType)
    const [defaultPeriod, setDefaultPeriod] = useState<TemporalPeriod | undefined>(dash.defaultPeriod ?? TemporalPeriod.ARBITRARY)
    const [allColumns, setAllColumns] = useState<string[]>([])
    const availableColumns: string[] = useMemo(() => {
        if (!isAggregate || !aggregateField)
            return allColumns

        return (groupField && groupField !== aggregateField) ? [aggregateField, groupField] : [aggregateField]
    }, [aggregateField, allColumns, groupField, isAggregate])
    const [dashType, setDashType] = useState<DashType>(dash.type)
    const dashRenderer: DashRenderer | null = useMemo(() => getRenderer(dashType), [dashType])

    useEffect(() => {
        datasetService.findAll()
            .then(datasets => {
                setDatasets(datasets)
                setDataset(datasets.find(d => d.name === dash.dataset))
            })
    }, [dash.dataset])

    useEffect(() => {
        setAllColumns(Object.keys(dataset?.spec?.columns ?? {}))
    }, [dataset?.spec?.columns])

    const resetFormFields = useCallback(() => {
        form.setFieldValue('sortField', undefined)
        form.setFieldValue('optValues', {})
    }, [form])

    const handleAggregateChange = useCallback((evt: CheckboxChangeEvent) => {
        form.setFieldValue('aggregateType', undefined)
        form.setFieldValue('aggregateField', undefined)
        form.setFieldValue('groupField', undefined)
        resetFormFields()
        setAggregate(evt.target.checked)
        setAggregateField(undefined)
        setGroupField(undefined)
    }, [form, resetFormFields])

    const handleAggregateFieldChange = useCallback((newAggregateField: string | undefined) => {
        form.setFieldValue('groupField', undefined)
        resetFormFields()
        setAggregateField(newAggregateField)
        setGroupField(undefined)
    }, [form, resetFormFields])

    const handleGroupFieldChange = useCallback((newGroupField: string | undefined) => {
        resetFormFields()
        setGroupField(newGroupField)
    }, [resetFormFields])

    const handleTemporalType = useCallback((temporalType: TemporalType) => {
        setTemporalType(temporalType)
        setDefaultPeriod(TemporalPeriod.ARBITRARY)
        form.setFieldValue('defaultPeriod', TemporalPeriod.ARBITRARY)
        form.setFieldValue('defaultStartTemporal', null)
        form.setFieldValue('defaultEndTemporal', null)
    }, [form])

    const handleDefaultPeriod = useCallback((defaultPeriod: TemporalPeriod) => {
        setDefaultPeriod(defaultPeriod)
        form.setFieldValue('defaultStartTemporal', null)
        form.setFieldValue('defaultEndTemporal', null)
    }, [form])

    return (
        <Form form={form} size="small" layout="vertical" disabled={!canEdit} onFinish={onFormFinish}>
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
                        <Select onSelect={setDataset}>
                            {datasets.map(d => <SelectOption key={d.name} value={d.name}>{d.name}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={6}>
                    <FormItem
                        className={styles.formItem}
                        name="type"
                        label={t('Type')}
                        initialValue={dash.type}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Select onSelect={setDashType}>
                            {dashTypes.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
            </Row>

            <Collapse defaultActiveKey={dashRenderer ? ['queryOptions', 'dashOptions'] : ['queryOptions']}>
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
                                <Select disabled={!isAggregate}>
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
                                <Select allowClear disabled={!isAggregate} onSelect={handleAggregateFieldChange} onClear={() => handleAggregateFieldChange(undefined)}>
                                    {allColumns.map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)}
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
                                <Select allowClear disabled={!isAggregate} onSelect={handleGroupFieldChange} onClear={() => handleGroupFieldChange(undefined)}>
                                    {allColumns.filter(c => c !== aggregateField).map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)}
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
                                    {availableColumns.map(c => <SelectOption key={c} value={c}>{c}</SelectOption>)}
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

                {dashRenderer && (
                    <>
                        <Panel header={t('Dash Options')} key="dashOptions">
                            <Row gutter={10}>
                                {dashRenderer.listOpts().map(p => (
                                    <Col key={p.name} span={6}>
                                        <DashOptFieldWrapper
                                            dashOpt={p}
                                            availableColumns={availableColumns}
                                            initialValue={dash.optValues ? dash.optValues[p.name] : undefined}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Panel>
                        <Panel header={t('Default Filters')} key="defaultFilters">

                        </Panel>
                    </>
                )}
            </Collapse>

            <Row gutter={10} style={{marginTop: 16}}>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="metricType"
                        label={t('Metric Type')}
                        initialValue={dash.metricType}
                    >
                        <Select>
                            {metricTypes.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="metricField"
                        label={t('Metric Field')}
                        initialValue={dash.metricField}
                    >
                        <Input/>
                    </FormItem>
                </Col>
                <Col span={8}>
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

            <Row gutter={10}>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="temporalType"
                        label={t('Temporal Type')}
                        initialValue={temporalType}
                    >
                        <Select onSelect={handleTemporalType}>
                            {temporalTypes.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="temporalField"
                        label={t('Temporal Field')}
                        initialValue={dash.temporalField}
                    >
                        <Input/>
                    </FormItem>
                </Col>
            </Row>

            {temporalType && (
                <Row gutter={10}>
                    <Col span={8}>
                        <FormItem
                            className={styles.formItem}
                            name="defaultPeriod"
                            label={t('Default Period')}
                            initialValue={defaultPeriod}
                        >
                            <Select onSelect={handleDefaultPeriod}>
                                {(temporalType === FieldType.time ? timeTemporalPeriods : allTemporalPeriods)
                                    .map(k => <SelectOption key={k} value={k}>{temporalPeriodTitles[k]}</SelectOption>)
                                }
                            </Select>
                        </FormItem>
                    </Col>

                    {defaultPeriod === TemporalPeriod.ARBITRARY && (
                        <>
                            <Col span={8}>
                                <FormItem
                                    className={styles.formItem}
                                    name="defaultStartTemporal"
                                    label={t('Default Begin')}
                                    initialValue={dash.defaultStartTemporal == null ? null : dayjs(dash.defaultStartTemporal)}
                                >
                                    {temporalType === FieldType.time ? (
                                        <TimePicker style={{width: '100%'}}/>
                                    ) : (
                                        <DatePicker
                                            style={{width: '100%'}}
                                            showTime={temporalType === FieldType.datetime || temporalType === FieldType.timestamp}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    className={styles.formItem}
                                    name="defaultEndTemporal"
                                    label={t('Default End')}
                                    initialValue={dash.defaultEndTemporal == null ? null : dayjs(dash.defaultEndTemporal)}
                                >
                                    {temporalType === FieldType.time ? (
                                        <TimePicker style={{width: '100%'}}/>
                                    ) : (
                                        <DatePicker
                                            style={{width: '100%'}}
                                            showTime={temporalType === FieldType.datetime || temporalType === FieldType.timestamp}
                                        />
                                    )}

                                </FormItem>
                            </Col>
                        </>
                    )}
                </Row>
            )}

            <Row gutter={10}>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="labelField"
                        label={t('Label Field')}
                        initialValue={dash.labelField}
                    >
                        <Input/>
                    </FormItem>
                </Col>
            </Row>

            <Row gutter={10}>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="refreshIntervalSeconds"
                        label={t('Refresh Interval (sec)')}
                        initialValue={dash.refreshIntervalSeconds}
                        rules={[
                            {required: true, message: t('Required field')},
                            {type: 'number', min: appConfig.dashboard.minRefreshIntervalSeconds}
                        ]}
                    >
                        <InputNumber min={appConfig.dashboard.minRefreshIntervalSeconds}/>
                    </FormItem>
                </Col>
            </Row>
        </Form>
    )
}