import {DashOptionsFormProps} from '../../../bi'
import {Col, Form, Input, Popover, Row, Select, Space, Tabs} from 'antd'
import React from 'react'
import {useTranslation} from 'react-i18next'
import styles from '../DashOptionForm.module.css'
import TransferInput from '../../../components/transfer-input/TransferInput'
import {QuestionCircleOutlined} from '@ant-design/icons'
import Icons from '../../../components/icons/Icons'
import Colors from '../../../components/colors/Colors'
import RulesHelp from './RulesHelp'

const {Item: FormItem} = Form
const {TextArea} = Input

export default function ReportDashOptionsForm({dataset, availableColNames, fieldName, values}: DashOptionsFormProps) {
    const {t} = useTranslation()
    const datasetColumns = dataset.spec.columns ?? {}

    const renderHelpContent = () => {
        return <Tabs items={[
            {key: 'rules', label: t('Rules'), children: <RulesHelp height={350}/>},
            {key: 'colors', label: t('Colors'), children: <Colors height={350}/>},
            {key: 'icons', label: t('Icons'), children: <Icons height={350}/>},
        ]}/>
    }

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
                        dataSource={availableColNames.map(cn => ({key: cn, title: datasetColumns[cn]?.alias ?? cn, description: cn}))}
                        listStyle={{width: 270, height: 220}}
                        titles={[t('All'), t('Selected')]}
                        render={item => <span title={item.description}>{item.title}</span>}
                    />
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
                                content={renderHelpContent()}
                                overlayInnerStyle={{width: 1060}}
                            >
                                <QuestionCircleOutlined className="blue"/>
                            </Popover>
                        </Space>
                    )}
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