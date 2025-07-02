import {Col, Form, Input, InputNumber, Popover, Row, Space} from 'antd'
import {QuestionCircleOutlined} from '@ant-design/icons'
import {useTranslation} from 'react-i18next'

import {DashOptionsFormProps} from '..'
import RulesHelp from 'src/bi/RulesHelp'
import {MAX_LAT, MAX_LNG, MIN_LAT, MIN_LNG} from '.'
import styles from '../DashOptionForm.module.css'

const {Item: FormItem} = Form
const {TextArea} = Input

export default function BubbleMapDashOptionsForm({fieldName, values}: DashOptionsFormProps) {
  const {t} = useTranslation()

  return (
    <Row gutter={10}>
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
          <InputNumber style={{width: '100%'}} min={MIN_LAT} max={MAX_LAT} step={0.01} />
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
          <InputNumber style={{width: '100%'}} min={MIN_LNG} max={MAX_LNG} step={0.01} />
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
          <InputNumber style={{width: '100%'}} min={1} max={19} step={1} />
        </FormItem>
      </Col>

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
