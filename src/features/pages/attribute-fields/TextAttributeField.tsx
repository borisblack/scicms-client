import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'
import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'
import {AttrType} from '../../../types'
import {FC} from 'react'

const FormItem = Form.Item
const {TextArea} = Input

const TextAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value}) => {
    if (attribute.type !== AttrType.text)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={t(attribute.displayName)}
            hidden={attribute.fieldHidden}
            initialValue={value}
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <TextArea style={{maxWidth: attribute.fieldWidth}} disabled={isDisabled} rows={4}/>
        </FormItem>
    )
}

export default TextAttributeField