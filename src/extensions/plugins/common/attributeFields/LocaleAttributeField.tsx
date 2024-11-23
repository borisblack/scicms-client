import {FC, useMemo} from 'react'
import {Form, Select} from 'antd'
import {useTranslation} from 'react-i18next'

import {FieldType} from 'src/types'
import {LOCALE_ATTR_NAME} from 'src/config/constants'
import {useRegistry} from 'src/util/hooks'
import {CustomAttributeFieldContext} from '../../types'
import styles from 'src/pages/app/attributeFields/AttributeField.module.css'

const FormItem = Form.Item
const {Option: SelectOption} = Select

export const LocaleAttributeField: FC<CustomAttributeFieldContext> = ({attrName, attribute, value, onChange}) => {
  if (attribute.type !== FieldType.string || attrName !== LOCALE_ATTR_NAME)
    throw new Error('Illegal attribute')

  const {locales} = useRegistry()
  const {t} = useTranslation()
  const isDisabled = useMemo(() => attribute.readOnly, [attribute.readOnly])
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
      <Select onSelect={(val: string) => onChange(val)} {...additionalProps}>
        {locales.map(it => <SelectOption key={it.name} value={it.name}>{it.displayName}</SelectOption>)}
      </Select>
    </FormItem>
  )
}
