import {FC, useCallback, useMemo} from 'react'
import {Checkbox, Form} from 'antd'

import {AttributeFieldProps} from '.'
import {FieldType} from '../../../types'
import styles from './AttributeField.module.css'
import {useTranslation} from 'react-i18next'

const FormItem = Form.Item

const BoolAttributeField: FC<AttributeFieldProps> = ({uniqueKey, attrName, attribute, value}) => {
    if (attribute.type !== FieldType.bool)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])

    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

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
            <Checkbox id={`${uniqueKey}#${attrName}`} style={{marginTop: 24}} {...additionalProps}>{t(attribute.displayName)}</Checkbox>
        </FormItem>
    )
}

export default BoolAttributeField