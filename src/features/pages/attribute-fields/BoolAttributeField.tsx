import {FC} from 'react'
import {Checkbox, Form} from 'antd'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {useTranslation} from 'react-i18next'

const FormItem = Form.Item

const BoolAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value}) => {
    if (attribute.type !== AttrType.bool)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            hidden={attribute.fieldHidden}
            valuePropName="checked"
            initialValue={value}
        >
            <Checkbox disabled={isDisabled}>{t(attribute.displayName)}</Checkbox>
        </FormItem>
    )
}

export default BoolAttributeField