import type {FC} from 'react'
import {useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, FormRule, Input} from 'antd'

import {AttributeFieldProps} from './index'
import {FieldType} from 'src/types'
import styles from './AttributeField.module.css'
import {ITEM_ITEM_NAME, MAJOR_REV_ATTR_NAME, NAME_ATTR_NAME, STATE_ATTR_NAME, UUID_PATTERN} from 'src/config/constants'
import {regExpRule} from 'src/util/form'
import {generateKey} from 'src/util/mdi'

const FormItem = Form.Item

const StringAttributeField: FC<AttributeFieldProps> = ({data: dataWrapper, attrName, attribute, value}) => {
  if (attribute.type !== FieldType.string && attribute.type !== FieldType.uuid
        && attribute.type !== FieldType.email && attribute.type !== FieldType.sequence)
    throw new Error('Illegal attribute')

  const {item, data} = dataWrapper
  const isNew = useMemo(() => !data?.id, [data?.id])
  const uniqueKey = generateKey(dataWrapper)
  const {t} = useTranslation()

  const isEnabled = useCallback((): boolean => {
    if (attribute.keyed || attribute.readOnly)
      return false

    if (item.name === ITEM_ITEM_NAME && attrName === NAME_ATTR_NAME && !isNew)
      return false

    if (attribute.type === FieldType.sequence)
      return false

    if (attrName === MAJOR_REV_ATTR_NAME) {
      if (item.versioned) {
        if (!item.manualVersioning)
          return false
      } else {
        return false
      }
    }

    return attrName !== STATE_ATTR_NAME
  }, [attrName, attribute.keyed, attribute.readOnly, attribute.type, item.manualVersioning, item.name, item.versioned, isNew])

  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (!isEnabled())
      additionalProps.disabled = true

    return additionalProps
  }, [isEnabled])

  const getRules = useCallback(() => {
    const rules: FormRule[] = [{
      required: (attribute.required && !attribute.readOnly) || (attrName === MAJOR_REV_ATTR_NAME && !!item.versioned && !!item.manualVersioning),
      message: t('Required field')
    }]

    switch (attribute.type) {
      case FieldType.uuid:
        rules.push(regExpRule(UUID_PATTERN, 'String must contain UUID'))
        break
      case FieldType.email:
        rules.push({type: 'email'})
        break
      case FieldType.string:
        if (attribute.pattern) {
          rules.push(regExpRule(new RegExp(attribute.pattern)))
        }
        break
      default:
        break
    }

    return rules
  }, [attrName, attribute, item, t])

  return (
    <FormItem
      className={styles.formItem}
      name={attrName}
      label={t(attribute.displayName)}
      hidden={attribute.fieldHidden}
      initialValue={value ?? attribute.defaultValue}
      rules={getRules()}
    >
      <Input
        id={`${uniqueKey}#${attrName}`}
        maxLength={attribute.length}
        {...additionalProps}
      />
    </FormItem>
  )
}

export default StringAttributeField