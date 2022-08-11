import {FormInstance, Input} from 'antd'
import {Attribute, AttrType} from '../../types'
import {useMemo} from 'react'
import ItemService from '../../services/item'
import FormItem from 'antd/es/form/FormItem'
import {useTranslation} from 'react-i18next'

interface Props {
    form: FormInstance
    attrName: string
    attribute: Attribute
    value: any
    canEdit: boolean
}

export default function AttributeInputWrapper({form, attrName, attribute, value, canEdit}: Props) {
    const {t} = useTranslation()
    const itemService = useMemo(() => ItemService.getInstance(), [])

    switch (attribute.type) {
        case AttrType.string:
        case AttrType.sequence:
        case AttrType.email:
        case AttrType.uuid:
            return (
                <FormItem
                    name={attrName}
                    label={attribute.displayName}
                    initialValue={value}
                    rules={[{required: attribute.required, message: t('Required field')}]}
                >
                    <Input disabled={!canEdit}/>
                </FormItem>
            )
        default:
            return null
    }
}