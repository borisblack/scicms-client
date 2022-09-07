import {FC, useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, FormRule, Input} from 'antd'

import {AttributeFieldProps} from '.'
import {AttrType} from '../../../types'
import styles from './AttributeField.module.css'
import {MAJOR_REV_ATTR_NAME, STATE_ATTR_NAME} from '../../../config/constants'

const FormItem = Form.Item

const StringAttributeField: FC<AttributeFieldProps> = ({item, attrName, attribute, value}) => {
    if (attribute.type !== AttrType.string && attribute.type !== AttrType.uuid
        && attribute.type !== AttrType.email && attribute.type !== AttrType.sequence)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()

    function isEnabled() {
        if (attribute.keyed || attribute.readOnly)
            return false

        if (attribute.type === AttrType.sequence)
            return false

        if (attrName === MAJOR_REV_ATTR_NAME) {
            if (item.versioned) {
                if (!item.manualVersioning)
                    return false
            } else {
                return false
            }
        }

        return attrName !== STATE_ATTR_NAME
    }

    const getRules = useCallback(() => {
        const rules: FormRule[] = [{
            required: (attribute.required && !attribute.readOnly) || (attrName === MAJOR_REV_ATTR_NAME && !!item.versioned && !!item.manualVersioning),
            message: t('Required field')
        }]

        switch (attribute.type) {
            case AttrType.uuid:
                rules.push({type: 'regexp', pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/})
                break
            case AttrType.email:
                rules.push({type: 'email'})
                break
            case AttrType.string:
                if (attribute.pattern) {
                    rules.push({type: 'regexp', pattern: new RegExp(attribute.pattern)})
                }
                break
            default:
                break
        }
        
        return rules
    }, [attrName, attribute, item, t])

    return (
        <FormItem
            className={styles.formItem}
            name={attrName}
            label={t(attribute.displayName)}
            hidden={attribute.fieldHidden}
            initialValue={value}
            rules={getRules()}
        >
            <Input style={{maxWidth: attribute.fieldWidth}} maxLength={attribute.length} disabled={!isEnabled()}/>
        </FormItem>
    )
}

export default StringAttributeField