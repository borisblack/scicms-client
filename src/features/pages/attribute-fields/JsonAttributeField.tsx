import {AttributeFieldProps} from '.'
import styles from '../AttributeInputWrapper.module.css'
import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'
import {AttrType} from '../../../types'
import {FC} from 'react'

const FormItem = Form.Item
const {TextArea} = Input

const JsonAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value, canEdit}) => {
    if (attribute.type !== AttrType.json && attribute.type !== AttrType.array)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly || !canEdit

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={attribute.displayName}
            initialValue={value ? JSON.stringify(value) : null}
            rules={[{required: attribute.required, message: t('Required field')}]}
        >
            <TextArea style={{maxWidth: attribute.fieldWidth}} disabled={isDisabled} rows={4}/>
        </FormItem>
    )
}

export default JsonAttributeField