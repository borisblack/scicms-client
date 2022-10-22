import {Form, FormInstance, Input, InputNumber, Select} from 'antd'
import {Dash, DashType} from '../../../types'
import styles from './DashboardSpec.module.css'
import {useTranslation} from 'react-i18next'

interface Props {
    form: FormInstance
    dash: Dash
    canEdit: boolean
    onFormFinish: (values: any) => void
}

const MIN_REFRESH_INTERVAL_SECONDS = 5

const {Item: FormItem} = Form
const {Option: SelectOption} = Select

export default function DashForm({form, dash, canEdit, onFormFinish}: Props) {
    const {t} = useTranslation()

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
                    {Object.keys(DashType).sort().map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
                </Select>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name="refreshIntervalSeconds"
                label={t('Refresh Interval (sec)')}
                initialValue={dash.refreshIntervalSeconds}
                rules={[
                    {required: true, message: t('Required field')},
                    {type: 'number', min: MIN_REFRESH_INTERVAL_SECONDS}
                ]}
            >
                <InputNumber min={MIN_REFRESH_INTERVAL_SECONDS}/>
            </FormItem>
        </Form>
    )
}