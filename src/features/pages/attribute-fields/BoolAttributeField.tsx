import {FC, useCallback} from 'react'
import {Checkbox, Form} from 'antd'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {useTranslation} from 'react-i18next'

const FormItem = Form.Item

const BoolAttributeField: FC<AttributeFieldProps> = ({pageKey, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.bool)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = attribute.keyed || attribute.readOnly

    const parseValue = useCallback((val: boolean | string | number | null | undefined) => {
        if (val === 1 || val === '1' || val === 'true')
            return true

        if (val === 0 ||  val === '0' || val === 'false')
            return false

        return val
    }, [])

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            hidden={attribute.fieldHidden}
            valuePropName="checked"
            initialValue={parseValue(value) ?? parseValue(attribute.defaultValue)}
        >
            <Checkbox id={`${pageKey}#${attrName}`} disabled={isDisabled}>{t(attribute.displayName)}</Checkbox>
        </FormItem>
    )
}

export default BoolAttributeField