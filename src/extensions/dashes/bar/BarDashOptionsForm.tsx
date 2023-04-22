import {DashOptionsFormProps} from '../../../bi'
import {Checkbox, Col, Form, Row, Select} from 'antd'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {legendPositions} from '../util'
import styles from '../DashOptionForm.module.css'

const {Item: FormItem} = Form

export default function BarDashOptionsForm({availableColNames, fieldName, values}: DashOptionsFormProps) {
    const {t} = useTranslation()
    const [isStack, setStack] = useState<boolean>(values.isStack)
    const [isGroup, setGroup] = useState<boolean>(values.isGroup)

    return (
        <Row gutter={10}>
            <Col span={8}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'xField']}
                    label={t('x-axis field')}
                    initialValue={values.xField}
                    rules={[{required: true, message: t('Required field')}]}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: cn}))}/>
                </FormItem>
            </Col>

            <Col span={8}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'yField']}
                    label={t('y-axis field')}
                    initialValue={values.yField}
                    rules={[{required: true, message: t('Required field')}]}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: cn}))}/>
                </FormItem>
            </Col>

            <Col span={8}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'seriesField']}
                    label={t('Series field')}
                    initialValue={values.seriesField}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: cn}))}/>
                </FormItem>
            </Col>

            <Col span={8}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'legendPosition']}
                    label={t('Legend position')}
                    initialValue={values.legendPosition ?? 'top-left'}
                >
                    <Select allowClear options={legendPositions.map(cn => ({value: cn, label: cn}))}/>
                </FormItem>
            </Col>

            <Col span={5}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'xAxisLabelAutoRotate']}
                    valuePropName="checked"
                    initialValue={values.xAxisLabelAutoRotate}
                >
                    <Checkbox style={{marginTop: 24}}>{t('Auto rotate x-axis label')}</Checkbox>
                </FormItem>
            </Col>

            <Col span={5}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'hideLegend']}
                    valuePropName="checked"
                    initialValue={values.hideLegend}
                >
                    <Checkbox style={{marginTop: 24}}>{t('Hide legend')}</Checkbox>
                </FormItem>
            </Col>

            <Col span={3}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'isStack']}
                    valuePropName="checked"
                    initialValue={values.isStack}
                >
                    <Checkbox style={{marginTop: 24}} onChange={e => setStack(e.target.checked)}>{t('Stack')}</Checkbox>
                </FormItem>
            </Col>

            <Col span={3}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'isGroup']}
                    valuePropName="checked"
                    initialValue={values.isGroup}
                >
                    <Checkbox style={{marginTop: 24}} onChange={e => setGroup(e.target.checked)}>{t('Group')}</Checkbox>
                </FormItem>
            </Col>
        </Row>
    )
}