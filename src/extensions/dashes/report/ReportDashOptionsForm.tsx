import {DashOptionsFormProps} from '../../../bi'
import {Col, Form, Input, Row, Select} from 'antd'
import React from 'react'
import {useTranslation} from 'react-i18next'
import styles from '../DashOptionForm.module.css'
import TransferInput from '../../../components/transfer-input/TransferInput'

const {Item: FormItem} = Form
const {TextArea} = Input

export default function ReportDashOptionsForm({dataset, availableColNames, fieldName, values}: DashOptionsFormProps) {
    const {t} = useTranslation()
    const datasetColumns = dataset.spec.columns ?? {}

    return (
        <Row gutter={10}>
            <Col span={12}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'displayedColNames']}
                    label={t('Displayed columns')}
                    initialValue={values.displayedColNames ?? []}
                >
                    <TransferInput
                        dataSource={availableColNames.map(cn => ({key: cn, title: datasetColumns[cn]?.alias ?? cn}))}
                        listStyle={{width: 270, height: 220}}
                        titles={[t('All'), t('Selected')]}
                        render={item => item.title}
                    />
                </FormItem>
            </Col>

            <Col span={12}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'rules']}
                    label={t('Rules')}
                    initialValue={values.rules}
                >
                    <TextArea rows={10}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'keyColName']}
                    label={t('Key column')}
                    initialValue={values.keyColName}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: datasetColumns[cn]?.alias ?? cn}))}/>
                </FormItem>
            </Col>
        </Row>
    )
}