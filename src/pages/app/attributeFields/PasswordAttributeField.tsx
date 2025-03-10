import {Form, Input} from 'antd'
import {FC, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {AttributeFieldProps} from '.'
import {FieldType} from 'src/types'
import styles from './AttributeField.module.css'
import {generateKey} from 'src/util/mdi'

const FormItem = Form.Item
const {Password} = Input

const PasswordAttributeField: FC<AttributeFieldProps> = ({form, itemTab: dataWrapper, attrName, attribute, value}) => {
  if (attribute.type !== FieldType.password) throw new Error('Illegal attribute')

  const uniqueKey = generateKey(dataWrapper)
  const {t} = useTranslation()
  const isDisabled = useMemo(() => attribute.readOnly, [attribute.readOnly])
  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (isDisabled) additionalProps.disabled = true

    return additionalProps
  }, [isDisabled])
  const password = Form.useWatch(attrName, form)

  return (
    <>
      <FormItem
        className={styles.formItem}
        name={attrName}
        label={t(attribute.displayName)}
        hidden={attribute.fieldHidden}
        initialValue={value ?? attribute.defaultValue}
        // hasFeedback
        rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
      >
        <Password id={`${uniqueKey}#${attrName}`} maxLength={attribute.length} {...additionalProps} />
      </FormItem>
      {attribute.confirm && (
        <Form.Item
          name={`${attrName}.confirm`}
          label={t('Confirm')}
          hidden={attribute.fieldHidden}
          initialValue={value ?? attribute.defaultValue}
          dependencies={[attrName]}
          // hasFeedback
          rules={[
            {
              required: Boolean(password),
              message: t('Please confirm password')
            },
            ({getFieldValue}) => ({
              validator(_, value) {
                if (!value || getFieldValue(attrName) === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error(t('Passwords do not match')))
              }
            })
          ]}
        >
          <Password id={`${uniqueKey}#${attrName}.confirm`} maxLength={attribute.length} {...additionalProps} />
        </Form.Item>
      )}
    </>
  )
}

export default PasswordAttributeField
