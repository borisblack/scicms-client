import _ from 'lodash'
import {FC, useCallback, useMemo} from 'react'
import {Checkbox, Form} from 'antd'
import {useTranslation} from 'react-i18next'

import {FieldType} from 'src/types'
import {LOCKED_BY_ATTR_NAME, NOT_LOCKABLE_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import {generateKey} from 'src/util/mdi'
import {Item} from 'src/types/schema'
import styles from 'src/pages/app/attributeFields/AttributeField.module.css'

const FormItem = Form.Item

export const NotLockableAttributeField: FC<CustomAttributeFieldContext> = ({data: dataWrapper, form, attrName, attribute, value}) => {
  if (attrName !== NOT_LOCKABLE_ATTR_NAME && attribute.type !== FieldType.bool)
    throw new Error('Illegal attribute')

  const {t} = useTranslation()
  const {data} = dataWrapper
  const isNew = !data?.id
  const uniqueKey = generateKey(dataWrapper)
  const isLockable = isNew || (data as Item).spec?.attributes.hasOwnProperty(LOCKED_BY_ATTR_NAME)
  const isDisabled = useMemo(() => !isLockable || attribute.readOnly, [attribute.readOnly, isLockable])

  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (isDisabled)
      additionalProps.disabled = true

    return additionalProps
  }, [isDisabled])

  const parseValue = useCallback((val: boolean | string | number | null | undefined) => {
    if (val === 1 || val === '1' || val === 'true')
      return true

    if (val === 0 ||  val === '0' || val === 'false')
      return false

    return val
  }, [])

  return (
    <FormItem
      className={styles.formItem}
      name={attrName}
      hidden={attribute.fieldHidden}
      valuePropName="checked"
      initialValue={isLockable ? (parseValue(value) ?? parseValue(attribute.defaultValue)) : true}
    >
      <Checkbox id={`${uniqueKey}#${attrName}`} style={{marginTop: 24}} {...additionalProps}>{t(attribute.displayName)}</Checkbox>
    </FormItem>
  )
}
