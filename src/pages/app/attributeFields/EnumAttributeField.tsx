import {FC, useMemo} from 'react'
import {Form, Select} from 'antd'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'
import {FieldType} from 'src/types'
import {generateKey} from 'src/util/mdi'
import styles from './AttributeField.module.css'

const FormItem = Form.Item

const EnumAttributeField: FC<AttributeFieldProps> = ({data: dataWrapper, attrName, attribute, value}) => {
  if (attribute.type !== FieldType.enum || !attribute.enumSet)
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
        {...additionalProps}
      />
    </FormItem>
  )
}

export default EnumAttributeField