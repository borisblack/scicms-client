import {FC, useMemo} from 'react'
import {Form, Select} from 'antd'

import {FieldType} from '../../../types'
import {useTranslation} from 'react-i18next'
import {LOCALE_ATTR_NAME} from '../../../config/constants'
import {CustomAttributeFieldRenderContext} from '../index'
import styles from '../CustomAttributeField.module.css'

const FormItem = Form.Item
const {Option: SelectOption} = Select

const LocaleAttributeField: FC<CustomAttributeFieldRenderContext> = ({locales, attrName, attribute, value, onChange}) => {
    if (attribute.type !== FieldType.string || attrName !== LOCALE_ATTR_NAME)
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
            <Select onSelect={(val: string) => onChange(val)} {...additionalProps}>
                {locales.map(it => <SelectOption key={it.name} value={it.name}>{it.displayName}</SelectOption>)}
            </Select>
        </FormItem>
    )
}

export default LocaleAttributeField