import {FC, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, InputNumber} from 'antd'

import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'
import {AttrType} from '../../../types'

const FormItem = Form.Item

const NumberAttributeField: FC<AttributeFieldProps> = ({pageKey, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.int && attribute.type !== AttrType.long
        && attribute.type !== AttrType.float && attribute.type !== AttrType.double
        && attribute.type !== AttrType.decimal)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const isDisabled = useMemo(() => attribute.keyed || attribute.readOnly, [attribute.keyed, attribute.readOnly])
    const additionalProps = useMemo((): any => {
        const additionalProps: any = {}
        if (isDisabled)
            additionalProps.disabled = true

        return additionalProps
    }, [isDisabled])

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={t(attribute.displayName)}
            hidden={attribute.fieldHidden}
            initialValue={value ?? (attribute.defaultValue ? parseFloat(attribute.defaultValue) : null)}
            rules={[
                { type: 'number', min: attribute.minRange, max: attribute.maxRange },
                {required: attribute.required && !attribute.readOnly, message: t('Required field')}
            ]}
        >
            <InputNumber
                id={`${pageKey}#${attrName}`}
                style={{width: attribute.fieldWidth}}
                min={attribute.minRange}
                max={attribute.maxRange}
                {...additionalProps}
            />
        </FormItem>
    )
}

export default NumberAttributeField