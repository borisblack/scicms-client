import {FC, useMemo} from 'react'
import {Form, Select} from 'antd'

import {AttributeFieldProps} from '.'
import {FieldType} from '../../../types'
import styles from './AttributeField.module.css'
import LocaleService from '../../../services/locale'
import {useTranslation} from 'react-i18next'

const LOCALE_ATTR_NAME = 'locale'

const FormItem = Form.Item
const {Option: SelectOption} = Select

const LocaleAttributeField: FC<AttributeFieldProps> = ({attrName, attribute, value, onChange}) => {
    if (attribute.type !== FieldType.string || attrName !== LOCALE_ATTR_NAME)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const localeService = useMemo(() => LocaleService.getInstance(), [])
    const locales = useMemo(() => localeService.locales, [localeService])
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