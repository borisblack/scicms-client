import {FC, useMemo} from 'react'
import {Form, Select} from 'antd'
import {useTranslation} from 'react-i18next'

import {FieldType} from 'src/types'
import {DEFAULT_SORT_ORDER_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import styles from 'src/pages/app/attributeFields/AttributeField.module.css'

const FormItem = Form.Item

const sortDirections = ['asc', 'desc']

export const DefaultSortOrderAttributeField: FC<CustomAttributeFieldContext> = ({attrName, attribute, value, onChange}) => {
  if (attrName !== DEFAULT_SORT_ORDER_ATTR_NAME || attribute.type !== FieldType.string)
    throw new Error('Illegal attribute')

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
      <Select
        options={sortDirections.map(dir => ({value: dir, label: dir}))}
        onSelect={(val: string) => onChange(val)}
        {...additionalProps}
      />
    </FormItem>
  )
}
