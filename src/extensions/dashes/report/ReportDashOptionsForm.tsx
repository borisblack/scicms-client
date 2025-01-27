import React from 'react'
import {useTranslation} from 'react-i18next'
import {Col, Form, Input, Popover, Row, Space} from 'antd'
import {QuestionCircleOutlined} from '@ant-design/icons'

import {DashOptionsFormProps} from '..'
import RulesHelp from 'src/bi/RulesHelp'
import styles from '../DashOptionForm.module.css'

const {Item: FormItem} = Form
const {TextArea} = Input

export default function ReportDashOptionsForm({dataset, availableColNames, fieldName, values}: DashOptionsFormProps) {
  const {t} = useTranslation()

  return (
    <Row gutter={10}>
      <Col span={12}>
        <FormItem
          className={styles.formItem}
          name={[fieldName, 'rules']}
          label={
            <Space>
              {t('Rules')}
              <Popover
                arrow={false}
                placement="bottom"
                content={<RulesHelp height={350} />}
                overlayInnerStyle={{width: 1060}}
              >
                <QuestionCircleOutlined className="blue" />
              </Popover>
            </Space>
          }
          initialValue={values.rules}
        >
          <TextArea rows={8} />
        </FormItem>
      </Col>
    </Row>
  )
}
