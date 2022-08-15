import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from '../AttributeInputWrapper.module.css'
import {FC} from 'react'

const MAJOR_REV_ATTR_NAME = 'majorRev'
const STATE_ATTR_NAME = 'state'

const FormItem = Form.Item

const StringAttributeField: FC<AttributeFieldProps> = ({item, attrName, attribute, value, canEdit}) => {
    if (attribute.type !== AttrType.string && attribute.type !== AttrType.uuid
        && attribute.type !== AttrType.email && attribute.type !== AttrType.sequence)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()

    function isEnabled() {
        if (attribute.keyed || attribute.readOnly)
            return false

        if (attrName === MAJOR_REV_ATTR_NAME && !item.manualVersioning)
            return false

        if (attrName === STATE_ATTR_NAME)
            return false

        return canEdit
    }

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={attribute.displayName}
            initialValue={value}
            rules={[{required: attribute.required, message: t('Required field')}]}
        >
            <Input style={{maxWidth: attribute.fieldWidth}} maxLength={attribute.length} disabled={!isEnabled()}/>
        </FormItem>
    )
}

export default StringAttributeField