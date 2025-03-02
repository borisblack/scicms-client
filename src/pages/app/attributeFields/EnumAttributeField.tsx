import {FC, useCallback, useMemo} from 'react'
import {Form, Select} from 'antd'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'
import {FieldType} from 'src/types'
import {generateKey} from 'src/util/mdi'
import styles from './AttributeField.module.css'

const FormItem = Form.Item

const EnumAttributeField: FC<AttributeFieldProps> = ({
  form,
  data: dataWrapper,
  attrName,
  attribute,
  value,
  onChange
}) => {
  if (attribute.type !== FieldType.enum || !attribute.enumSet) throw new Error('Illegal attribute')

  const uniqueKey = generateKey(dataWrapper)
  const {t} = useTranslation()
  const isDisabled = useMemo(() => attribute.readOnly, [attribute.readOnly])
  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (isDisabled) additionalProps.disabled = true

    return additionalProps
  }, [isDisabled])

  function handleChange(val: string) {
    form.setFieldValue(attrName, val)
    onChange(val)
  }

  return (
    <FormItem
      className={styles.formItem}
      name={attrName}
      label={t(attribute.displayName)}
      hidden={attribute.fieldHidden}
      initialValue={value ?? attribute.defaultValue}
      rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
    >
      <Select
        id={`${uniqueKey}#${attrName}`}
        allowClear
        options={attribute.enumSet.map(entry => ({label: t(entry), value: entry}))}
        onSelect={handleChange}
        {...additionalProps}
      />
    </FormItem>
  )
}

export default EnumAttributeField
