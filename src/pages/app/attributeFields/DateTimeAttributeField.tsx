import {FC, useCallback, useMemo} from 'react'
import {Checkbox, DatePicker, Form} from 'antd'
import {useTranslation} from 'react-i18next'
import dayjs, {Dayjs} from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import {AttributeFieldProps} from '.'
import {FieldType} from 'src/types'
import styles from './AttributeField.module.css'
import {UTC} from 'src/config/constants'
import {generateKey} from 'src/util/mdi'
import {useAppProperties} from 'src/util/hooks'

dayjs.extend(timezone)

const FormItem = Form.Item

const DateTimeAttributeField: FC<AttributeFieldProps> = ({itemTab: dataWrapper, form, attrName, attribute, value}) => {
  const appProps = useAppProperties()
  const {momentDisplayDateTimeFormatString} = appProps.dateTime

  if (attribute.type !== FieldType.datetime && attribute.type !== FieldType.timestamp)
    throw new Error('Illegal attribute')

  const uniqueKey = generateKey(dataWrapper)
  const {t} = useTranslation()
  const isDisabled = useMemo(() => attribute.readOnly, [attribute.readOnly])
  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (isDisabled) additionalProps.disabled = true

    return additionalProps
  }, [isDisabled])

  function getValueFromEvent(evt: Dayjs) {
    form.setFieldValue(`${attrName}.changed`, true)
    return evt
  }

  const parseValue = useCallback((val: string | null | undefined) => (val == null ? null : dayjs.tz(val, UTC)), [])

  return (
    <>
      <FormItem
        className={styles.formItem}
        name={attrName}
        label={t(attribute.displayName)}
        hidden={attribute.fieldHidden}
        initialValue={parseValue(value) ?? parseValue(attribute.defaultValue)}
        getValueFromEvent={getValueFromEvent}
        rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
      >
        <DatePicker
          id={`${uniqueKey}#${attrName}`}
          style={{width: '100%'}}
          showTime
          showSecond={false}
          format={momentDisplayDateTimeFormatString}
          {...additionalProps}
        />
      </FormItem>
      <FormItem name={`${attrName}.changed`} valuePropName="checked" hidden>
        <Checkbox id={`${uniqueKey}#${attrName}.changed`} />
      </FormItem>
    </>
  )
}

export default DateTimeAttributeField
