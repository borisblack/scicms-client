import {FC, useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {DatePicker, Form} from 'antd'
import {FieldType} from 'src/types'
import {AttributeFieldProps} from '.'
import {generateKey} from 'src/util/mdi'
import styles from './AttributeField.module.css'
import {useAppProperties} from 'src/util/hooks'

dayjs.extend(utc)

const FormItem = Form.Item

const DateAttributeField: FC<AttributeFieldProps> = ({data: dataWrapper, attrName, attribute, value}) => {
  const appProps = useAppProperties()
  const {momentDisplayDateFormatString} = appProps.dateTime

  if (attribute.type !== FieldType.date)
    throw new Error('Illegal attribute')

  const uniqueKey = generateKey(dataWrapper)
  const {t} = useTranslation()
  const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (isDisabled)
      additionalProps.disabled = true

    return additionalProps
  }, [isDisabled])

  const parseValue = useCallback((val: string | null | undefined) => val == null ? null : dayjs.utc(val), [])

  return (
    <FormItem
      className={styles.formItem}
      name={attrName}
      label={t(attribute.displayName)}
      hidden={attribute.fieldHidden}
      initialValue={parseValue(value) ?? parseValue(attribute.defaultValue)}
      rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
    >
      <DatePicker
        id={`${uniqueKey}#${attrName}`}
        style={{width: '100%'}}
        format={momentDisplayDateFormatString}
        {...additionalProps}
      />
    </FormItem>
  )
}

export default DateAttributeField