import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'
import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'
import {AttrType} from '../../../types'
import {FC, useCallback} from 'react'
import appConfig from '../../../config'

const FormItem = Form.Item
const {TextArea} = Input

const JsonAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value}) => {
    if (attribute.type !== AttrType.json && attribute.type !== AttrType.array)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

    const parseValue = useCallback((val: any) => val == null ? null : JSON.stringify(val), [])

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={t(attribute.displayName)}
            hidden={attribute.fieldHidden}
            initialValue={parseValue(value) ?? attribute.defaultValue}
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <TextArea style={{maxWidth: attribute.fieldWidth}} disabled={isDisabled} rows={appConfig.ui.textArea.rows}/>
        </FormItem>
    )
}

export default JsonAttributeField