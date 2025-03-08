import _ from 'lodash'
import {FC, useMemo} from 'react'
import {Form, Select} from 'antd'
import {useTranslation} from 'react-i18next'

import {FieldType} from 'src/types'
import {INCLUDE_TEMPLATES_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import {useRegistry} from 'src/util/hooks'
import {generateKey} from 'src/util/mdi'
import {requiredFieldRule} from 'src/util/form'

import styles from 'src/pages/app/attributeFields/AttributeField.module.css'

const FormItem = Form.Item

export const IncludeTemplatesAttributeField: FC<CustomAttributeFieldContext> = ({
  itemTab: dataWrapper,
  form,
  attrName,
  attribute,
  value
}) => {
  if (attrName !== INCLUDE_TEMPLATES_ATTR_NAME || attribute.type !== FieldType.array)
    throw new Error('Illegal attribute')

  const {t} = useTranslation()
  const uniqueKey = generateKey(dataWrapper)
  const {itemTemplates} = useRegistry()
  const isDisabled = useMemo(() => attribute.readOnly, [attribute.readOnly])
  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (isDisabled) additionalProps.disabled = true

    return additionalProps
  }, [isDisabled])

  function parseValue(val: any): string[] | undefined {
    if (val == null) return undefined

    if (!_.isArray(val)) throw new Error('Illegal attribute')

    const arr = val.map(it => {
      if (_.isObject(it)) return JSON.stringify(it)

      return it
    })

    return arr
  }

  return (
    <>
      <FormItem
        className={styles.formItem}
        name={attrName}
        label={t(attribute.displayName)}
        hidden={attribute.fieldHidden}
        initialValue={
          parseValue(value) ?? (attribute.defaultValue ? parseValue(JSON.parse(attribute.defaultValue)) : undefined)
        }
        rules={[requiredFieldRule(attribute.required && !attribute.readOnly)]}
      >
        <Select
          id={`${uniqueKey}#${attrName}`}
          allowClear
          mode="multiple"
          options={Object.keys(itemTemplates).map(t => ({value: t, label: t}))}
          {...additionalProps}
        />
      </FormItem>
    </>
  )
}
