import {FC} from 'react'
import {Checkbox, Form} from 'antd'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from '../AttributeInputWrapper.module.css'

const FormItem = Form.Item

const BoolAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value, canEdit}) => {
    if (attribute.type !== AttrType.bool)
        throw new Error('Illegal attribute')

    const isDisabled = attribute.keyed || attribute.readOnly || !canEdit

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            valuePropName="checked"
            initialValue={value}
        >
            <Checkbox disabled={isDisabled}>{attribute.displayName}</Checkbox>
        </FormItem>
    )
}

export default BoolAttributeField