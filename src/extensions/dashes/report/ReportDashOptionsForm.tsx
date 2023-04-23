import {DashOptionsFormProps} from '../../../bi'
import {Checkbox, Col, Form, Row} from 'antd'
import React from 'react'
import {useTranslation} from 'react-i18next'
import styles from '../DashOptionForm.module.css'

const {Item: FormItem} = Form

export default function ReportDashOptionsForm({dataset, availableColNames, fieldName, values}: DashOptionsFormProps) {
    const {t} = useTranslation()
    const datasetColumns = dataset.spec.columns ?? {}

    return (
        <Row gutter={10}>
            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'displayedColNames']}
                    label={t('Displayed columns')}
                    initialValue={values.displayedColNames ?? []}
                >
                    <Checkbox.Group style={{width: '100%'}}>
                        <Row>
                            {availableColNames.map(cn => <Col key={cn} span={24}><Checkbox value={cn}>{datasetColumns[cn]?.alias ?? cn}</Checkbox></Col>)}
                        </Row>
                    </Checkbox.Group>
                </FormItem>
            </Col>
        </Row>
    )
}