import {FC} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, InputNumber} from 'antd'

import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'
import {AttrType} from '../../../types'

const FormItem = Form.Item

const NumberAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value}) => {
    if (attribute.type !== AttrType.int && attribute.type !== AttrType.long
        && attribute.type !== AttrType.float && attribute.type !== AttrType.double
        && attribute.type !== AttrType.decimal)
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
            rules={[
                { type: 'number', min: attribute.minRange, max: attribute.maxRange },
                {required: attribute.required && !attribute.readOnly, message: t('Required field')}
            ]}
        >
            <InputNumber
                style={{width: attribute.fieldWidth}}
                min={attribute.minRange}
                max={attribute.maxRange}
                disabled={isDisabled}
            />
        </FormItem>
    )
}

export default NumberAttributeField