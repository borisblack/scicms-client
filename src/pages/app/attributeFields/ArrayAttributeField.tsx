import _ from 'lodash'
import {FC, useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, Input} from 'antd'
import {AttributeFieldProps} from '.'
import {FieldType} from 'src/types'
import appConfig from 'src/config'
import {generateKey} from 'src/util/mdi'
import styles from './AttributeField.module.css'

const FormItem = Form.Item
const {TextArea} = Input

const ArrayAttributeField: FC<AttributeFieldProps> = ({data: dataWrapper, attrName, attribute, value}) => {
  if (attribute.type !== FieldType.array)
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

  const parseValue = useCallback((val: any) => {
    if (val == null)
      return null

    if (!_.isArray(val))
      throw new Error('Illegal attribute')

    const arr = val.map(it => {
      if (_.isObject(it))
        return JSON.stringify(it)

      return it
    })

    return arr.join('\n')
  }, [])

  return (
    <FormItem
      className={styles.formItem}
      name={attrName}
      label={t(attribute.displayName)}
      hidden={attribute.fieldHidden}
      initialValue={parseValue(value) ?? (attribute.defaultValue ? parseValue(JSON.parse(attribute.defaultValue)) : null)}
      rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
    >
      <TextArea
        id={`${uniqueKey}#${attrName}`}
        rows={appConfig.ui.form.textAreaRows}
        {...additionalProps}
      />
    </FormItem>
  )
}

export default ArrayAttributeField