import {DashOptionsFormProps} from '../../../bi'
import {Checkbox, Col, Form, Input, Popover, Row, Select, Space} from 'antd'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {legendPositions} from '../util'
import styles from '../DashOptionForm.module.css'
import RulesHelp from '../../../bi/RulesHelp'
import {QuestionCircleOutlined} from '@ant-design/icons'

const {Item: FormItem} = Form
const {TextArea} = Input

export default function BubbleMapDashOptionsForm({dataset, availableColNames, fieldName, values}: DashOptionsFormProps) {
    const {t} = useTranslation()
    const datasetColumns = dataset.spec.columns ?? {}

    return (
        <Row gutter={10}>
            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'latitudeField']}
                    label={t('Latitude field')}
                    initialValue={values.latitudeField}
                    rules={[{required: true, message: t('Required field')}]}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: datasetColumns[cn]?.alias ?? cn}))}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'longitudeField']}
                    label={t('Longitude field')}
                    initialValue={values.longitudeField}
                    rules={[{required: true, message: t('Required field')}]}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: datasetColumns[cn]?.alias ?? cn}))}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'locationField']}
                    label={t('Location field')}
                    initialValue={values.locationField}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: datasetColumns[cn]?.alias ?? cn}))}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'sizeField']}
                    label={t('Size field')}
                    initialValue={values.sizeField}
                    rules={[{required: true, message: t('Required field')}]}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: datasetColumns[cn]?.alias ?? cn}))}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'colorField']}
                    label={t('Color field')}
                    initialValue={values.colorField}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: datasetColumns[cn]?.alias ?? cn}))}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'legendPosition']}
                    label={t('Legend position')}
                    initialValue={values.legendPosition ?? 'top-left'}
                >
                    <Select allowClear options={legendPositions.map(p => ({value: p, label: p}))}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'hideLegend']}
                    valuePropName="checked"
                    initialValue={values.hideLegend}
                >
                    <Checkbox style={{marginTop: 24}}>{t('Hide legend')}</Checkbox>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'xAxisLabelAutoRotate']}
                    valuePropName="checked"
                    initialValue={values.xAxisLabelAutoRotate}
                >
                    <Checkbox style={{marginTop: 24}}>{t('Auto rotate x-axis label')}</Checkbox>
                </FormItem>
            </Col>

            <Col span={12}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'rules']}
                    label={(
                        <Space>
                            {t('Rules')}
                            <Popover
                                arrow={false}
                                placement="bottom"
                                content={<RulesHelp height={350}/>}
                                overlayInnerStyle={{width: 1060}}
                            >
                                <QuestionCircleOutlined className="blue"/>
                            </Popover>
                        </Space>
                    )}
                    initialValue={values.rules}
                >
                    <TextArea rows={8}/>
                </FormItem>
            </Col>
        </Row>
    )
}