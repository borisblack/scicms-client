import {Form, FormInstance, Input, InputNumber, Select} from 'antd'
import {DashType, IDash} from '../../../types'
import styles from './DashboardSpec.module.css'
import {useTranslation} from 'react-i18next'
import appConfig from '../../../config'
import {useEffect} from 'react'

interface Props {
    form: FormInstance
    dash: IDash | null
    canEdit: boolean
    onFormFinish: (values: any) => void
}

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

export default function DashForm({form, dash, canEdit, onFormFinish}: Props) {
    const {t} = useTranslation()

    useEffect(() => {
        form.resetFields()
    }, [form, dash])

    return (
        <Form form={form} size="small" layout="vertical" disabled={!canEdit} onFinish={onFormFinish}>
            <FormItem
                className={styles.formItem}
                name="name"
                label={t('Name')}
                initialValue={dash?.name}
                rules={[{required: true, message: t('Required field')}]}
            >
                <Input/>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name="displayName"
                label={t('Display Name')}
                initialValue={dash?.displayName}
                rules={[{required: true, message: t('Required field')}]}
            >
                <Input/>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name="type"
                label={t('Type')}
                initialValue={dash?.type}
                rules={[{required: true, message: t('Required field')}]}
            >
                <Select>
                    {Object.keys(DashType).sort().map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                </Select>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name="refreshIntervalSeconds"
                label={t('Refresh Interval (sec)')}
                initialValue={dash?.refreshIntervalSeconds}
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