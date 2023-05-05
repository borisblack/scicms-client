import React from 'react'
import {useTranslation} from 'react-i18next'
import {Checkbox, Col, Form, Input, Popover, Row, Select, Space} from 'antd'
import {QuestionCircleOutlined} from '@ant-design/icons'
import {DashOptionsFormProps} from '../../../bi'
import {legendPositions} from '../util'
import RulesHelp from '../../../bi/RulesHelp'
import styles from '../DashOptionForm.module.css'

const {Item: FormItem} = Form
const {TextArea} = Input

export default function BarDashOptionsForm({dataset, availableColNames, fieldName, values}: DashOptionsFormProps) {
    const {t} = useTranslation()
    const datasetColumns = dataset.spec.columns ?? {}

    return (
        <Row gutter={10}>
            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'xField']}
                    label={t('x-axis field')}
                    initialValue={values.xField}
                    rules={[{required: true, message: t('Required field')}]}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: datasetColumns[cn]?.alias ?? cn}))}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'yField']}
                    label={t('y-axis field')}
                    initialValue={values.yField}
                    rules={[{required: true, message: t('Required field')}]}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: datasetColumns[cn]?.alias ?? cn}))}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'seriesField']}
                    label={t('Series field')}
                    initialValue={values.seriesField}
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
                    name={[fieldName, 'xAxisLabelAutoRotate']}
                    valuePropName="checked"
                    initialValue={values.xAxisLabelAutoRotate}
                >
                    <Checkbox style={{marginTop: 24}}>{t('Auto rotate x-axis label')}</Checkbox>
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
                    name={[fieldName, 'isStack']}
                    valuePropName="checked"
                    initialValue={values.isStack}
                >
                    <Checkbox style={{marginTop: 24}}>{t('Stack')}</Checkbox>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'isGroup']}
                    valuePropName="checked"
                    initialValue={values.isGroup}
                >
                    <Checkbox style={{marginTop: 24}}>{t('Group')}</Checkbox>
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