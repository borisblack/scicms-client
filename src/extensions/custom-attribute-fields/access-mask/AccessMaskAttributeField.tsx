import {FC, useCallback, useMemo} from 'react'
import {Checkbox, Form, InputNumber} from 'antd'
import {useTranslation} from 'react-i18next'
import {ACCESS_ITEM_NAME, MASK_ATTR_NAME} from 'src/config/constants'
import {clearBit, getBit, setBit} from 'src/util'
import {CustomAttributeFieldRenderContext} from '..'
import {generateKey} from 'src/util/mdi'
import styles from '../CustomAttributeField.module.css'

const FormItem = Form.Item

const AccessMaskAttributeField: FC<CustomAttributeFieldRenderContext> = ({data: dataWrapper, form, attrName, attribute, value}) => {
  const {item} = dataWrapper
  if (item.name !== ACCESS_ITEM_NAME || attrName !== MASK_ATTR_NAME)
    throw new Error('Illegal attribute')

  const uniqueKey = generateKey(dataWrapper)
  const {t} = useTranslation()
  const isDisabled = useMemo(() => attribute.readOnly, [attribute.readOnly])
  const additionalProps = useMemo((): any => {
    const additionalProps: any = {}
    if (isDisabled)
      additionalProps.disabled = true

    return additionalProps
  }, [isDisabled])
  const isRequired = useMemo(() => attribute.required && !attribute.readOnly, [attribute.readOnly, attribute.required])

  const initialValue = useMemo(() => value ?? (attribute.defaultValue == null ? 0 : parseInt(attribute.defaultValue)), [attribute.defaultValue, value])

  const handleChange = useCallback((value: boolean, i: number) => {
    const curVal = form.getFieldValue(attrName)
    const newVal: number = value ? setBit(curVal, i) : clearBit(curVal, i)
    form.setFieldValue(attrName, newVal)
  }, [attrName, form])

  return (
    <>
      <FormItem
        className={styles.formItem}
        name={attrName}
        label={t(attribute.displayName)}
        hidden
        initialValue={initialValue}
        rules={[
          { type: 'number', min: attribute.minRange, max: attribute.maxRange },
          {required: isRequired, message: t('Required field')}
        ]}
      >
        <InputNumber
          id={`${uniqueKey}#${attrName}`}
          style={{display: 'none'}}
          min={attribute.minRange}
          max={attribute.maxRange}
          {...additionalProps}
        />
      </FormItem>

      <div className="ant-form-item" style={{margin: '0 0 3px'}}>
        <div className="ant-row ant-form-item-row">
          <div className="ant-col ant-form-item-label">
            <label htmlFor={attrName} className={isRequired ? 'ant-form-item-required' : ''} title={t(attribute.displayName)}>
              {t(attribute.displayName)}
            </label>
          </div>
        </div>
      </div>
      <Checkbox id={`${uniqueKey}#${attrName}.read`} defaultChecked={getBit(initialValue, 0)} onChange={evt => handleChange(evt.target.checked, 0)}><b>R</b>ead</Checkbox>
      <Checkbox id={`${uniqueKey}#${attrName}.write`} defaultChecked={getBit(initialValue, 1)} onChange={evt => handleChange(evt.target.checked, 1)}><b>W</b>rite</Checkbox>
      <Checkbox id={`${uniqueKey}#${attrName}.create`} defaultChecked={getBit(initialValue, 2)} onChange={evt => handleChange(evt.target.checked, 2)}><b>C</b>reate</Checkbox>
      <Checkbox id={`${uniqueKey}#${attrName}.delete`} defaultChecked={getBit(initialValue, 3)} onChange={evt => handleChange(evt.target.checked, 3)}><b>D</b>elete</Checkbox>
      <Checkbox id={`${uniqueKey}#${attrName}.administration`} defaultChecked={getBit(initialValue, 4)} onChange={evt => handleChange(evt.target.checked, 4)}><b>A</b>dministration</Checkbox>
    </>
  )
}

export default AccessMaskAttributeField