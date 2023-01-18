import {FC, useMemo} from 'react'
import {Form, Select} from 'antd'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {useTranslation} from 'react-i18next'

const FormItem = Form.Item
const {Option: SelectOption} = Select

const EnumAttributeField: FC<AttributeFieldProps> = ({pageKey, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.enum || !attribute.enumSet)
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
            <Select id={`${pageKey}#${attrName}`} style={{maxWidth: attribute.fieldWidth}} {...additionalProps}>
                {attribute.enumSet.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
            </Select>
        </FormItem>
    )
}

export default EnumAttributeField