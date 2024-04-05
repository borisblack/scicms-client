import React, {FC, useState} from 'react'
import {DatePicker, Form, Input, InputNumber, Select, Space, Switch, TimePicker} from 'antd'
import {FunctionOutlined} from '@ant-design/icons'
import {useTranslation} from 'react-i18next'
import {FilterValueFieldProps} from './index'
import {
  allTemporalUnits,
  columnType,
  isTemporal,
  temporalPeriods,
  temporalPeriodTitles,
  temporalUnitTitles,
  timeTemporalUnits
} from 'src/bi/util'
import {FieldType} from 'src/types'
import {QueryOp, TemporalPeriod, TemporalType} from 'src/types/bi'
import appConfig from 'src/config'
import styles from '../DashFilters.module.css'

const INPUT_WIDTH = 180
const BETWEEN_INPUT_WIDTH = 140
const {Item: FormItem} = Form
const {momentDisplayDateFormatString, momentDisplayTimeFormatString, momentDisplayDateTimeFormatString} = appConfig.dateTime

const TemporalFilterValueField: FC<FilterValueFieldProps> = ({form, namePrefix, column, op}) => {
  if (namePrefix.length === 0)
    throw new Error('Illegal argument')

  if (!isTemporal(column.type))
    throw new Error('Illegal argument')

  const fieldName = namePrefix[namePrefix.length - 1]
  const temporalType = columnType(column) as TemporalType
  const {t} = useTranslation()
  const [isManual, setManual] = useState(form.getFieldValue([...namePrefix, 'extra', 'isManual']))
  const [period, setPeriod] = useState(form.getFieldValue([...namePrefix, 'extra', 'period']) ?? TemporalPeriod.ARBITRARY)
  const [isManualLeft, setManualLeft] = useState(form.getFieldValue([...namePrefix, 'extra', 'isManualLeft']))
  const [isManualRight, setManualRight] = useState(form.getFieldValue([...namePrefix, 'extra', 'isManualRight']))

  function handleManualChange(newManual: boolean) {
    setManual(newManual)
    form.setFieldValue([...namePrefix, 'value'], null)
  }

  function handleManualLeftChange(newManualLeft: boolean) {
    setManualLeft(newManualLeft)
    form.setFieldValue([...namePrefix, 'extra', 'left'], null)
    form.setFieldValue([...namePrefix, 'value'], null)
  }

  function handleManualRightChange(newManualRight: boolean) {
    setManualRight(newManualRight)
    form.setFieldValue([...namePrefix, 'extra', 'right'], null)
    form.setFieldValue([...namePrefix, 'value'], null)
  }

  const renderDefaultContent = () => (
    <Space>
      <FormItem
        className={styles.formItem}
        name={[fieldName, 'value']}
        rules={[{required: true, message: ''}]}
      >
        {isManual ? (
          <Input bordered={false} style={{width: INPUT_WIDTH}} placeholder={t('Value')}/>
        ) : (
          temporalType === FieldType.time ? (
            <TimePicker
              bordered={false}
              style={{width: INPUT_WIDTH}}
              placeholder={t('Value')}
              format={momentDisplayTimeFormatString}
            />
          ) : (
            <DatePicker
              bordered={false}
              style={{width: INPUT_WIDTH}}
              placeholder={t('Value')}
              format={temporalType === FieldType.date ? momentDisplayDateFormatString : momentDisplayDateTimeFormatString}
              showTime={temporalType === FieldType.datetime || temporalType === FieldType.timestamp}
            />
          )
        )}
      </FormItem>
      <FormItem
        className={styles.formItem}
        name={[fieldName, 'extra', 'isManual']}
        valuePropName="checked"
      >
        <Switch
          className={styles.switch}
          title={t('Edit manually')}
          checkedChildren={<FunctionOutlined/>}
          unCheckedChildren={<FunctionOutlined/>}
          onChange={handleManualChange}
        />
      </FormItem>
    </Space>
  )

  const renderBetweenContent = () => (
    <Space>
      <FormItem
        className={styles.formItem}
        name={[fieldName, 'extra', 'period']}
        rules={[{required: true, message: ''}]}
      >
        <Select
          bordered={false}
          style={{width: 140}}
          options={temporalPeriods.map(k => ({value: k, label: temporalPeriodTitles[k]}))}
          onSelect={setPeriod}
        />
      </FormItem>

      {period === TemporalPeriod.ARBITRARY ? (
        <>
          <FormItem
            className={styles.formItem}
            name={[fieldName, 'extra', 'left']}
            rules={[{required: true, message: ''}]}
          >
            {isManualLeft ? (
              <Input bordered={false} style={{width: BETWEEN_INPUT_WIDTH}} placeholder={t('Begin')}/>
            ) : (
              temporalType === FieldType.time ? (
                <TimePicker
                  bordered={false}
                  style={{width: BETWEEN_INPUT_WIDTH}}
                  placeholder={t('Begin')}
                  format={momentDisplayTimeFormatString}
                />
              ) : (
                <DatePicker
                  bordered={false}
                  style={{width: BETWEEN_INPUT_WIDTH}}
                  placeholder={t('Begin')}
                  format={temporalType === FieldType.date ? momentDisplayDateFormatString : momentDisplayDateTimeFormatString}
                  showTime={temporalType === FieldType.datetime || temporalType === FieldType.timestamp}
                />
              )
            )}
          </FormItem>
          <FormItem
            className={styles.formItem}
            name={[fieldName, 'extra', 'isManualLeft']}
            valuePropName="checked"
          >
            <Switch
              className={styles.switch}
              title={t('Edit manually')}
              checkedChildren={<FunctionOutlined/>}
              unCheckedChildren={<FunctionOutlined/>}
              onChange={handleManualLeftChange}
            />
          </FormItem>

          <FormItem
            className={styles.formItem}
            name={[fieldName, 'extra', 'right']}
            rules={[{required: true, message: ''}]}
          >
            {isManualRight ? (
              <Input bordered={false} style={{width: BETWEEN_INPUT_WIDTH}} placeholder={t('End')}/>
            ) : (
              temporalType === FieldType.time ? (
                <TimePicker
                  bordered={false}
                  style={{width: BETWEEN_INPUT_WIDTH}}
                  placeholder={t('End')}
                  format={momentDisplayTimeFormatString}
                />
              ) : (
                <DatePicker
                  bordered={false}
                  style={{width: BETWEEN_INPUT_WIDTH}}
                  placeholder={t('End')}
                  format={temporalType === FieldType.date ? momentDisplayDateFormatString : momentDisplayDateTimeFormatString}
                  showTime={temporalType === FieldType.datetime || temporalType === FieldType.timestamp}
                />
              )
            )}

          </FormItem>
          <FormItem
            className={styles.formItem}
            name={[fieldName, 'extra', 'isManualRight']}
            valuePropName="checked"
          >
            <Switch
              className={styles.switch}
              title={t('Edit manually')}
              checkedChildren={<FunctionOutlined/>}
              unCheckedChildren={<FunctionOutlined/>}
              onChange={handleManualRightChange}
            />
          </FormItem>
        </>
      ) : (
        <>
          <FormItem
            className={styles.formItem}
            name={[fieldName, 'extra', 'value']}
            rules={[{required: true, message: ''}]}
          >
            <InputNumber bordered={false} placeholder={t('number')}/>
          </FormItem>

          <FormItem
            className={styles.formItem}
            name={[fieldName, 'extra', 'unit']}
            rules={[{required: true, message: ''}]}
          >
            <Select
              bordered={false}
              style={{width: 100}}
              placeholder={t('unit')}
              options={(temporalType === FieldType.time ? timeTemporalUnits : allTemporalUnits).map(k => ({value: k, label: temporalUnitTitles[k]}))}
            />
          </FormItem>
        </>
      )}
    </Space>
  )

  switch (op) {
    case QueryOp.$null:
    case QueryOp.$notNull:
      return null
    case QueryOp.$eq:
    case QueryOp.$ne:
    case QueryOp.$gt:
    case QueryOp.$gte:
    case QueryOp.$lt:
    case QueryOp.$lte:
      return renderDefaultContent()
    case QueryOp.$between:
      return renderBetweenContent()
    default:
      return <span className="red">{t('Unsupported operator')}</span>
  }
}

export default TemporalFilterValueField