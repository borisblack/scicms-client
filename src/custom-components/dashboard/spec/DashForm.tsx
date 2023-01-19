import {Checkbox, Form, FormInstance, Input, InputNumber, Select} from 'antd'
import {AggregateType, DashType, IDash} from '../../../types'
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
    isAggregate: boolean
    labelField: string
    aggregateType?: AggregateType
    refreshIntervalSeconds: number
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

export default function DashForm({form, dash, canEdit, onFormFinish}: Props) {
    const {t} = useTranslation()
    const datasetService = useMemo(() => DatasetService.getInstance(), [])
    const [datasetNames, setDatasetNames] = useState<string[]>([])
    const [isAggregate, setAggregate] = useState<boolean>(dash.isAggregate)

    useEffect(() => {
        datasetService.findAll().then(data => setDatasetNames(data.map(it => it.name).sort()))
    }, [datasetService])

    useEffect(() => {
        form.resetFields()
        setAggregate(dash.isAggregate)
    }, [form, dash])
    
    const handleAggregateChange = useCallback((evt: CheckboxChangeEvent) => {
        setAggregate(evt.target.checked)
    }, [])

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
                name="dataset"
                label={t('Dataset')}
                initialValue={dash.dataset}
                rules={[{required: true, message: t('Required field')}]}
            >
                <Select>
                    {datasetNames.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                </Select>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name="labelField"
                label={t('Label Field')}
                initialValue={dash.labelField}
                rules={[{required: true, message: t('Required field')}]}
            >
                <Input/>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name="isAggregate"
                initialValue={dash.isAggregate}
                valuePropName="checked"
            >
                <Checkbox checked={isAggregate} onChange={handleAggregateChange}>{t('Aggregate')}</Checkbox>
            </FormItem>

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
        </Form>
    )
}