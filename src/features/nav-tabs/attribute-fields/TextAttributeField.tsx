import {AttributeFieldProps} from '.'
import styles from './AttributeField.module.css'
import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'
import {FieldType} from '../../../types'
import {FC, useMemo} from 'react'

const FormItem = Form.Item
const {TextArea} = Input

const TextAttributeField: FC<AttributeFieldProps> = ({uniqueKey, attrName, attribute, value}) => {
    if (attribute.type !== FieldType.text)
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
            initialValue={value ?? attribute.defaultValue}
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <TextArea
                id={`${uniqueKey}#${attrName}`}
                rows={4}
                {...additionalProps}
            />
        </FormItem>
    )
}

export default TextAttributeField