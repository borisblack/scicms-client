import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {FC} from 'react'

const FormItem = Form.Item
const {Password} = Input

const PasswordAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value}) => {
    if (attribute.type !== AttrType.password)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={attribute.displayName}
            initialValue={value}
            rules={[{required: attribute.required, message: t('Required field')}]}
        >
            <Password style={{maxWidth: attribute.fieldWidth}} maxLength={attribute.length} disabled={isDisabled}/>
        </FormItem>
    )
}

export default PasswordAttributeField