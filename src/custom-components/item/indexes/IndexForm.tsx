import {useEffect} from 'react'
import {Checkbox, Form, FormInstance, Input} from 'antd'

import {useTranslation} from 'react-i18next'
import {NamedIndex} from '../../../types'
import appConfig from '../../../config'
import styles from './Indexes.module.css'

interface Props {
    form: FormInstance
    index: NamedIndex | null
    canEdit: boolean
    onFormFinish: (values: any) => void
}

const {Item: FormItem} = Form
const {TextArea} = Input

export default function IndexForm({form, index, canEdit, onFormFinish}: Props) {
    const {t} = useTranslation()
    
    useEffect(() => {
        form.resetFields()
    }, [form, index])

    return (
        <Form form={form} size="small" layout="vertical" disabled={!canEdit} onFinish={onFormFinish}>
            <FormItem
                className={styles.formItem}
                name="name"
                label={t('Name')}
                initialValue={index?.name}
                rules={[{required: true, message: t('Required field')}]}
            >
                <Input style={{maxWidth: 300}} maxLength={50}/>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name="columns"
                label={t('Columns')}
                initialValue={index?.columns?.join('\n')}
                rules={[{required: true, message: t('Required field')}]}
            >
                <TextArea style={{maxWidth: 180}} rows={appConfig.ui.textArea.rows}/>
            </FormItem>

            <FormItem
                className={styles.formItem}
                name="unique"
                valuePropName="checked"
                initialValue={index?.unique}
            >
                <Checkbox>{t('Unique')}</Checkbox>
            </FormItem>
        </Form>
    )
}