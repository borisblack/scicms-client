import {FC} from 'react'
import {Form, Select} from 'antd'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {useTranslation} from 'react-i18next'

const FormItem = Form.Item
const {Option: SelectOption} = Select

const EnumAttributeField: FC<AttributeFieldProps> = ({item, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.enum || !attribute.enumSet)
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
            rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
        >
            <Select style={{maxWidth: attribute.fieldWidth}} disabled={isDisabled}>
                {attribute.enumSet.map(it => <SelectOption key={it} value={it}>{it}</SelectOption>)}
            </Select>
        </FormItem>
    )
}

export default EnumAttributeField