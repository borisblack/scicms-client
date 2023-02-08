import {Checkbox, Col, Form, FormInstance, Input, InputNumber, Row, Select} from 'antd'
import {AggregateType, AttrType, DashType, IDash, MetricType, NumericType, TemporalType} from '../../../types'
import styles from './DashboardSpec.module.css'
import {useTranslation} from 'react-i18next'
import appConfig from '../../../config'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {dashTypes} from '../../../util/dashboard'
import DatasetService from '../../../services/dataset'
import {CheckboxChangeEvent} from 'antd/es/checkbox'

interface Props {
    form: FormInstance
    dash: IDash
    canEdit: boolean
    onFormFinish: (dash: DashValues) => void
}

export interface DashValues {
    name: string
    type: DashType
    dataset: string
    metricType?: MetricType
    metricField?: string
    unit?: string
    labelField?: string
    temporalType?: TemporalType
    temporalField?: string
    latitudeField?: string
    longitudeField?: string
    locationField?: string
    isAggregate: boolean
    aggregateType?: AggregateType
    sortField?: string
    sortDirection?: string
    refreshIntervalSeconds: number
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

const numericTypes: NumericType[] = [AttrType.int, AttrType.long, AttrType.float, AttrType.double, AttrType.decimal]
const temporalTypes: TemporalType[] = [AttrType.date, AttrType.time, AttrType.datetime, AttrType.timestamp]
const metricTypes: MetricType[] = [...numericTypes, ...temporalTypes]


export default function DashForm({form, dash, canEdit, onFormFinish}: Props) {
    const {t} = useTranslation()
    const datasetService = useMemo(() => DatasetService.getInstance(), [])
    const [datasetNames, setDatasetNames] = useState<string[]>([])
    const [isAggregate, setAggregate] = useState<boolean>(dash.isAggregate)

    useEffect(() => {
        datasetService.findAll().then(datasets => setDatasetNames(datasets.map(it => it.name).sort()))
    }, [datasetService, dash])

    useEffect(() => {
        form.resetFields()
        setAggregate(dash.isAggregate)
    }, [form, dash])

    const handleAggregateChange = useCallback((evt: CheckboxChangeEvent) => {
        setAggregate(evt.target.checked)
    }, [])

    return (
        <Form form={form} size="small" layout="vertical" disabled={!canEdit} onFinish={onFormFinish}>
            <Row gutter={10}>
                <Col span={8}>
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
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="type"
                        label={t('Type')}
                        initialValue={dash.type}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Select>
                            {dashTypes.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="dataset"
                        label={t('Dataset')}
                        initialValue={dash.dataset}
                        rules={[{required: true, message: t('Required field')}]}
                    >
                        <Select>
                            {datasetNames.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                        </Select>
                    </FormItem>
                </Col>
            </Row>

            <Row gutter={10}>
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
                <Col span={4}>
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
                        initialValue={dash.temporalType}
                    >
                        <Select>
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

            <Row gutter={10}>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="latitudeField"
                        label={t('Latitude Field')}
                        initialValue={dash.latitudeField}
                    >
                        <Input/>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="longitudeField"
                        label={t('Longitude Field')}
                        initialValue={dash.longitudeField}
                    >
                        <Input/>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                        className={styles.formItem}
                        name="locationField"
                        label={t('Location Field')}
                        initialValue={dash.locationField}
                    >
                        <Input/>
                    </FormItem>
                </Col>
            </Row>

            <Row gutter={10}>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name="isAggregate"
                        initialValue={dash.isAggregate}
                        valuePropName="checked"
                    >
                        <Checkbox checked={isAggregate} onChange={handleAggregateChange} style={{marginTop: 24}}>{t('Aggregate')}</Checkbox>
                    </FormItem>
                </Col>
                <Col span={12}>
                    {isAggregate &&
                        <FormItem
                            className={styles.formItem}
                            name="aggregateType"
                            label={t('Aggregate Type')}
                            dependencies={['isAggregate']}
                            initialValue={dash.aggregateType}
                            rules={[({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!getFieldValue('isAggregate') || value != null)
                                        return Promise.resolve()

                                    return Promise.reject(new Error(t('Required field')))
                                },
                            })]}
                        >
                            <Select>
                                {Object.keys(AggregateType).map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                            </Select>
                        </FormItem>
                    }
                </Col>
            </Row>

            <Row gutter={10}>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name="labelField"
                        label={t('Label Field')}
                        initialValue={dash.labelField}
                    >
                        <Input/>
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        className={styles.formItem}
                        name="sortField"
                        label={t('Sort Field')}
                        initialValue={dash.sortField}
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