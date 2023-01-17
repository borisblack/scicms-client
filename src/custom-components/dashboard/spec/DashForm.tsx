import {Form, FormInstance, Input, InputNumber, Select} from 'antd'
import {DashType, IDash} from '../../../types'
import styles from './DashboardSpec.module.css'
import {useTranslation} from 'react-i18next'
import appConfig from '../../../config'
import {useEffect, useMemo, useState} from 'react'
import {dashTypes} from '../../../util/dashboard'
import DatasetService from '../../../services/dataset'

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
    refreshIntervalSeconds: number
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

export default function DashForm({form, dash, canEdit, onFormFinish}: Props) {
    const {t} = useTranslation()
    const datasetService = useMemo(() => DatasetService.getInstance(), [])
    const [datasetNames, setDatasetNames] = useState<string[]>([])

    useEffect(() => {
        datasetService.findAll().then(data => setDatasetNames(data.map(it => it.name).sort()))
    }, [datasetService])

    useEffect(() => {
        form.resetFields()
    }, [form, dash])

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