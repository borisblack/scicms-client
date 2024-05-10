import {FC, useMemo} from 'react'
import {Form, Select} from 'antd'
import {useTranslation} from 'react-i18next'

import {FieldType} from 'src/types'
import {CustomAttributeFieldContext} from '../../types'
import FieldTypeIcon from 'src/components/FieldTypeIcon'
import {PropertyType} from 'src/types/schema'
import styles from 'src/pages/app/attributeFields/AttributeField.module.css'

const FormItem = Form.Item

const propertyTypes: PropertyType[] = [
  FieldType.uuid,
  FieldType.string,
  FieldType.text,
  FieldType.email,
  FieldType.int,
  FieldType.long,
  FieldType.float,
  FieldType.double,
  FieldType.decimal,
  FieldType.date,
  FieldType.time,
  FieldType.datetime,
  FieldType.timestamp,
  FieldType.bool,
  FieldType.array,
  FieldType.json
]

export const PropertyTypeAttributeField: FC<CustomAttributeFieldContext> = ({attrName, attribute, value, form, onChange}) => {
  const {t} = useTranslation()
  const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (isDisabled)
      additionalProps.disabled = true

    return additionalProps
  }, [isDisabled])

  function handleChange(val: string) {
    form.setFieldValue('value', undefined)
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
        options={propertyTypes.sort().map(pt => ({
          value: pt,
          label: (
            <span className="text-ellipsis">
              <FieldTypeIcon fieldType={pt as FieldType} />
              &nbsp;&nbsp;
              {pt}
            </span>
          )
        }))}
        onSelect={handleChange}
        {...additionalProps}
      />
    </FormItem>
  )
}
