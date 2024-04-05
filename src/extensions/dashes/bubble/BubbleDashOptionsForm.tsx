import {DashOptionsFormProps} from '..'
import {Checkbox, Col, Form, Input, Popover, Row, Select, Space} from 'antd'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {legendPositions} from '../util'
import styles from '../DashOptionForm.module.css'
import RulesHelp from '../../../bi/RulesHelp'
import {QuestionCircleOutlined} from '@ant-design/icons'

const {Item: FormItem} = Form
const {TextArea} = Input

export default function BubbleDashOptionsForm({fieldName, values}: DashOptionsFormProps) {
  const {t} = useTranslation()

  return (
    <Row gutter={10}>
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