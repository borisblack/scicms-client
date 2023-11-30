import {FC, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, InputNumber} from 'antd'
import {AttributeFieldProps} from '.'
import {FieldType} from 'src/types'
import {generateKey} from 'src/util/mdi'
import styles from './AttributeField.module.css'

const FormItem = Form.Item

const NumberAttributeField: FC<AttributeFieldProps> = ({data: dataWrapper, attrName, attribute, value}) => {
    if (attribute.type !== FieldType.int && attribute.type !== FieldType.long
        && attribute.type !== FieldType.float && attribute.type !== FieldType.double
        && attribute.type !== FieldType.decimal)
        throw new Error('Illegal attribute')

    const uniqueKey = generateKey(dataWrapper)
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
                id={`${uniqueKey}#${attrName}`}
                style={{width: '50%'}}
                min={attribute.minRange}
                max={attribute.maxRange}
                {...additionalProps}
            />
        </FormItem>
    )
}

export default NumberAttributeField