import {Button, Form, FormInstance, Input, InputNumber, Select} from 'antd'
import {AttrType, DashItem, DashType, IDash, MetricType, TemporalType} from '../../../types'
import styles from './DashboardSpec.module.css'
import {useTranslation} from 'react-i18next'
import appConfig from '../../../config'
import DashItemField from './DashItemField'
import {useCallback, useEffect, useState} from 'react'
import {PlusCircleOutlined} from '@ant-design/icons'

interface Props {
    form: FormInstance
    dash: IDash
    canEdit: boolean
    onChange: (dash: DashValues) => void
    onFormFinish: (dash: DashValues) => void
}

export interface DashValues {
    name: string
    displayName: string
    type: DashType
    refreshIntervalSeconds: number
    metricType: MetricType
    temporalType?: TemporalType
    items: DashItem[]
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

const dashTypes = Object.keys(DashType).sort()
const numericTypes = [AttrType.int, AttrType.long, AttrType.float, AttrType.double, AttrType.decimal]
const temporalTypes = [AttrType.date, AttrType.time, AttrType.datetime, AttrType.timestamp]
const metricTypes = [...numericTypes, ...temporalTypes, AttrType.bool]

export default function DashForm({form, dash, canEdit, onFormFinish, onChange}: Props) {
    const {t} = useTranslation()
    const [metricType, setMetricType] = useState<MetricType>(dash.metricType)
    const [temporalType, setTemporalType] = useState<TemporalType | undefined>(dash.temporalType)

    useEffect(() => {
        form.resetFields()
    }, [form, dash])

    const handleItemAdd = useCallback(() => {
        const newDash = form.getFieldsValue() as IDash
        const newItems = [...(Object.values(newDash.items ?? {}) as DashItem[]), {}]
        onChange({...newDash, items: newItems})
    }, [form, onChange])

    const handleItemRemove = useCallback((index: number) => {
        const newDash = form.getFieldsValue() as IDash
        const newItems = (Object.values(newDash.items ?? {}) as DashItem[]).filter((_, i) => i !== index)
        onChange({...newDash, items: newItems})
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
                name="displayName"
                label={t('Display Name')}
                initialValue={dash.displayName}
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

            <h4>{t('Items')}</h4>
            <Button type="primary" style={{marginBottom: 16}} icon={<PlusCircleOutlined/>} disabled={!canEdit} onClick={handleItemAdd}>
                {t('Add Item')}
            </Button>

            {dash.items?.map((item, i) => (
                <DashItemField
                    key={i}
                    form={form}
                    index={i}
                    item={dash.items[i]}
                    metricType={metricType}
                    temporalType={temporalType}
                    onRemove={() => handleItemRemove(i)}
                />
            ))}
        </Form>
    )
}