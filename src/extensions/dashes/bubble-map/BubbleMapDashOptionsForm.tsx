import {DashOptionsFormProps} from '..'
import {Col, Form, Input, InputNumber, Popover, Row, Select, Space} from 'antd'
import React from 'react'
import {useTranslation} from 'react-i18next'
import styles from '../DashOptionForm.module.css'
import RulesHelp from '../../../bi/RulesHelp'
import {QuestionCircleOutlined} from '@ant-design/icons'
import {MAX_LAT, MAX_LNG, MIN_LAT, MIN_LNG} from './index'

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
                    name={[fieldName, 'labelField']}
                    label={t('Label field')}
                    initialValue={values.labelField}
                >
                    <Select allowClear options={availableColNames.map(cn => ({value: cn, label: datasetColumns[cn]?.alias ?? cn}))}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'centerLatitude']}
                    label={t('Center latitude')}
                    initialValue={values.centerLatitude}
                    rules={[
                        {type: 'number', min: MIN_LAT},
                        {type: 'number', max: MAX_LAT}
                    ]}
                >
                    <InputNumber style={{width: '100%'}} min={MIN_LAT} max={MAX_LAT} step={0.01}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'centerLongitude']}
                    label={t('Center longitude')}
                    initialValue={values.centerLongitude}
                    rules={[
                        {type: 'number', min: MIN_LNG},
                        {type: 'number', max: MAX_LNG}
                    ]}
                >
                    <InputNumber style={{width: '100%'}} min={MIN_LNG} max={MAX_LNG} step={0.01}/>
                </FormItem>
            </Col>

            <Col span={6}>
                <FormItem
                    className={styles.formItem}
                    name={[fieldName, 'defaultZoom']}
                    label={t('Default zoom')}
                    initialValue={values.defaultZoom}
                    rules={[
                        {type: 'number', min: 1},
                        {type: 'number', max: 19}
                    ]}
                >
                    <InputNumber style={{width: '100%'}} min={1} max={19} step={1}/>
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