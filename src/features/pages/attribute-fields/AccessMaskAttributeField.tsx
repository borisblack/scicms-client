import {FC, useCallback, useMemo} from 'react'
import {Checkbox, Form, InputNumber} from 'antd'

import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'
import {useTranslation} from 'react-i18next'
import {ACCESS_ITEM_NAME, MASK_ATTR_NAME} from '../../../config/constants'
import {clearBit, getBit, setBit} from '../../../util'

const FormItem = Form.Item

const AccessMaskAttributeField: FC<AttributeFieldProps> = ({pageKey, form, item, attrName, attribute, value}) => {
    if (item.name !== ACCESS_ITEM_NAME || attrName !== MASK_ATTR_NAME)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.readOnly
    const isRequired = attribute.required && !attribute.readOnly

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
                    id={`${pageKey}#${attrName}`}
                    style={{width: attribute.fieldWidth, display: 'none'}}
                    min={attribute.minRange}
                    max={attribute.maxRange}
                    disabled={isDisabled}
                />
            </FormItem>

            <div className="ant-form-item" style={{margin: 0}}>
                <div className="ant-row ant-form-item-row">
                    <div className="ant-col ant-form-item-label">
                        <label htmlFor={attrName} className={isRequired ? 'ant-form-item-required' : ''} title={t(attribute.displayName)}>
                            {t(attribute.displayName)}
                        </label>
                    </div>
                </div>
            </div>
            <Checkbox id={`${pageKey}#${attrName}.read`} defaultChecked={getBit(initialValue, 0)} onChange={evt => handleChange(evt.target.checked, 0)}><b>R</b>ead</Checkbox><br/>
            <Checkbox id={`${pageKey}#${attrName}.write`} defaultChecked={getBit(initialValue, 1)} onChange={evt => handleChange(evt.target.checked, 1)}><b>W</b>rite</Checkbox><br/>
            <Checkbox id={`${pageKey}#${attrName}.create`} defaultChecked={getBit(initialValue, 2)} onChange={evt => handleChange(evt.target.checked, 2)}><b>C</b>reate</Checkbox><br/>
            <Checkbox id={`${pageKey}#${attrName}.delete`} defaultChecked={getBit(initialValue, 3)} onChange={evt => handleChange(evt.target.checked, 3)}><b>D</b>elete</Checkbox><br/>
            <Checkbox id={`${pageKey}#${attrName}.administration`} style={{marginBottom: 8}} defaultChecked={getBit(initialValue, 4)} onChange={evt => handleChange(evt.target.checked, 4)}><b>A</b>dministration</Checkbox>
        </>
    )
}

export default AccessMaskAttributeField