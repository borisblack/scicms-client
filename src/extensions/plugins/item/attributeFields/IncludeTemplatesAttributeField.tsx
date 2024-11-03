import _ from 'lodash'
import {FC, useCallback, useEffect, useMemo, useState} from 'react'
import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'

import {FieldType} from 'src/types'
import {INCLUDE_TEMPLATES_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import TransferInput from 'src/uiKit/TransferInput'
import {useRegistry} from 'src/util/hooks'
import {generateKey} from 'src/util/mdi'

import styles from 'src/pages/app/attributeFields/AttributeField.module.css'
import './IncludeTemplatesAttributeField.css'

const FormItem = Form.Item
const {TextArea} = Input

export const IncludeTemplatesAttributeField: FC<CustomAttributeFieldContext> = ({data: dataWrapper, form, attrName, attribute, value, onChange}) => {
  if (attrName !== INCLUDE_TEMPLATES_ATTR_NAME || attribute.type !== FieldType.array)
    throw new Error('Illegal attribute')

  const {t} = useTranslation()
  const uniqueKey = generateKey(dataWrapper)
  const {itemTemplates} = useRegistry()
  const defaultIncludeTemplates: string[] | undefined =
    useMemo(() => parseValue(value) ?? (attribute.defaultValue ? parseValue(JSON.parse(attribute.defaultValue)) : undefined), [attribute.defaultValue, value])
  const [includeTemplates, setIncludeTemplates] = useState(defaultIncludeTemplates)

  useEffect(() => {
    setIncludeTemplates(defaultIncludeTemplates)
  }, [dataWrapper, defaultIncludeTemplates])

  function parseValue(val: any): string[] | undefined {
    if (val == null)
      return undefined

    if (!_.isArray(val))
      throw new Error('Illegal attribute')

    const arr = val.map(it => {
      if (_.isObject(it))
        return JSON.stringify(it)

      return it
    })

    return arr
  }

  function handleChange(targetKeys: string[]) {
    setIncludeTemplates(targetKeys)
    form.setFieldValue(attrName, targetKeys)
  }

  return (
    <>
      <FormItem
        className={styles.formItem}
        name={attrName}
        label={t(attribute.displayName)}
        initialValue={parseValue(value) ?? (attribute.defaultValue ? parseValue(JSON.parse(attribute.defaultValue)) : null)}
      >
        <TextArea id={`${uniqueKey}#${attrName}`} hidden/>
      </FormItem>

      <div className="include-templates-wrapper">
        <TransferInput
          dataSource={Object.keys(itemTemplates).map(template => ({key: template, title: template, description: template}))}
          value={includeTemplates}
          render={item => item.title}
          onChange={handleChange}
        />
      </div>
    </>
  )
}
