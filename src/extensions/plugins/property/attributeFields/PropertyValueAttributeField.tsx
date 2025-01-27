import type {FC} from 'react'
import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'

import {PropertyValue} from '../components'
import {CustomAttributeFieldContext} from '../../types'
import {useItemAcl} from 'src/util/hooks'
import './PropertyValueAttributeField.css'
import styles from 'src/pages/app/attributeFields/AttributeField.module.css'

const FormItem = Form.Item

export const PropertyValueAttributeField: FC<CustomAttributeFieldContext> = ({
  data: dataWrapper,
  attrName,
  attribute,
  value,
  form,
  onChange
}) => {
  const {t} = useTranslation()
  const {item, data} = dataWrapper
  const acl = useItemAcl(item, data)
  const propertyType = Form.useWatch('type', form)
  const propertyValue = Form.useWatch(attrName, form)

  function handleChange(val: string | null | undefined) {
    form.setFieldValue(attrName, val)
    onChange(val)
  }

  return (
    <>
      <FormItem
        className={styles.formItem}
        name={attrName}
        label={t(attribute.displayName)}
        hidden={attribute.fieldHidden}
        initialValue={value ?? attribute.defaultValue}
        rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
      >
        <Input hidden />
      </FormItem>

      <div className="property-value-attribute-field-wrapper">
        <PropertyValue
          type={propertyType}
          value={propertyValue ?? attribute.defaultValue}
          canEdit={acl.canWrite}
          onChange={handleChange}
        />
      </div>
    </>
  )
}
