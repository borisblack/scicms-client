import {Checkbox, FormInstance, Input} from 'antd'
import {Attribute, AttrType, Item} from '../../types'
import {useMemo} from 'react'
import ItemService from '../../services/item'
import FormItem from 'antd/es/form/FormItem'
import {useTranslation} from 'react-i18next'
import './AttributeInputWrapper.css'
import styles from './AttributeInputWrapper.module.css'

interface Props {
    form: FormInstance
    item: Item
    attrName: string
    attribute: Attribute
    value: any
    canEdit: boolean
}

const MAJOR_REV_ATTR_NAME = 'majorRev'
const STATE_ATTR_NAME = 'state'

export default function AttributeInputWrapper({form, item, attrName, attribute, value, canEdit}: Props) {
    const {t} = useTranslation()
    const itemService = useMemo(() => ItemService.getInstance(), [])

    function isEnabled() {
        if (attrName === MAJOR_REV_ATTR_NAME && !item.manualVersioning)
            return false

        if (attrName === STATE_ATTR_NAME)
            return false

        return !attribute.keyed && canEdit
    }

    switch (attribute.type) {
        case AttrType.string:
        case AttrType.sequence:
        case AttrType.email:
        case AttrType.uuid:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <Input disabled={!isEnabled()}/>
                </FormItem>
            )
        case AttrType.bool:
            return (
                <FormItem
                    className={styles.formItem}
                    name={attrName}
                    valuePropName="checked"
                    initialValue={value}
                >
                    <Checkbox disabled={!isEnabled()}>{attribute.displayName}</Checkbox>
                </FormItem>
            )
        default:
            return null
    }
}