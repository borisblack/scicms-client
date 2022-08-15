import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, InputNumber} from 'antd'

import {AttributeFieldProps} from '.'
import styles from '../AttributeInputWrapper.module.css'
import {AttrType} from '../../../types'

const FormItem = Form.Item

const NumberAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value, canEdit}) => {
    if (attribute.type !== AttrType.int && attribute.type !== AttrType.long
        && attribute.type !== AttrType.float && attribute.type !== AttrType.double
        && attribute.type !== AttrType.decimal)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly || !canEdit

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={attribute.displayName}
            initialValue={value}
            rules={[{required: attribute.required, message: t('Required field')}]}
        >
            <InputNumber
                style={{maxWidth: attribute.fieldWidth}}
                min={attribute.minRange}
                max={attribute.maxRange}
                disabled={isDisabled}
            />
        </FormItem>
    )
}

export default NumberAttributeField