import {Button, Form, FormInstance, Input, InputNumber, Select} from 'antd'
import {DashType, Dataset, IDash, MetricType, TemporalType} from '../../../types'
import styles from './DashboardSpec.module.css'
import {useTranslation} from 'react-i18next'
import appConfig from '../../../config'
import DatasetField from './DatasetField'
import {useCallback, useEffect, useState} from 'react'
import {PlusCircleOutlined} from '@ant-design/icons'
import {dashTypes, metricTypes, temporalTypes} from '../../../util/dashboard'

interface Props {
    form: FormInstance
    dash: IDash
    canEdit: boolean
    onChange: (dash: DashValues) => void
    onFormFinish: (dash: DashValues) => void
}

export interface DashValues {
    name: string
    type: DashType
    refreshIntervalSeconds: number
    metricType: MetricType
    temporalType?: TemporalType
    datasets: Dataset[]
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

export default function DashForm({form, dash, canEdit, onFormFinish, onChange}: Props) {
    const {t} = useTranslation()
    const [metricType, setMetricType] = useState<MetricType>(dash.metricType)
    const [temporalType, setTemporalType] = useState<TemporalType | undefined>(dash.temporalType)

    useEffect(() => {
        form.resetFields()
    }, [form, dash])

    const handleItemAdd = useCallback(() => {
        const newDash = form.getFieldsValue() as IDash
        const newDatasets = [...(Object.values(newDash.datasets ?? {}) as Dataset[]), {}]
        onChange({...newDash, datasets: newDatasets})
    }, [form, onChange])

    const handleDatasetRemove = useCallback((index: number) => {
        const newDash = form.getFieldsValue() as IDash
        const newDatasets = (Object.values(newDash.datasets ?? {}) as Dataset[]).filter((_, i) => i !== index)
        onChange({...newDash, datasets: newDatasets})
    }, [form, onChange])

    return (
        <Form form={form} size="small" layout="vertical" disabled={!canEdit} onFinish={onFormFinish}>
            <FormItem
                className={styles.formItem}
                name="name"
                label={t('Name')}
                initialValue={dash.name}
                rules={[{required: true, message: t('Required field')}]}
            >
                <Input/>
            </FormItem>

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

            <FormItem
                className={styles.formItem}
                name="metricType"
                label={t('Metric Type')}
                initialValue={dash.metricType}
                rules={[{required: true, message: t('Required field')}]}
            >
                <Select onSelect={setMetricType}>
                    {metricTypes.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                </Select>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name="temporalType"
                label={t('Temporal Type')}
                initialValue={dash.temporalType}
            >
                <Select onSelect={setTemporalType}>
                    {temporalTypes.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                </Select>
            </FormItem>

            <h4>{t('Datasets')}</h4>
            <Button type="primary" style={{marginBottom: 16}} icon={<PlusCircleOutlined/>} disabled={!canEdit} onClick={handleItemAdd}>
                {t('Add Dataset')}
            </Button>

            {dash.datasets?.map((dataset, i) => (
                <DatasetField
                    key={i}
                    form={form}
                    index={i}
                    dataset={dataset}
                    metricType={metricType}
                    temporalType={temporalType}
                    onRemove={() => handleDatasetRemove(i)}
                />
            ))}
        </Form>
    )
}