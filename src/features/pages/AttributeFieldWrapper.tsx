import {AttrType} from '../../types'
import {AttributeFieldProps, AttributeFields} from './attribute-fields'
import RelationAttributeField from './attribute-fields/RelationAttributeField'
import DateTimeAttributeField from './attribute-fields/DateTimeAttributeField'
import TimeAttributeField from './attribute-fields/TimeAttributeField'
import DateAttributeField from './attribute-fields/DateAttributeField'
import NumberAttributeField from './attribute-fields/NumberAttributeField'
import JsonAttributeField from './attribute-fields/JsonAttributeField'
import TextAttributeField from './attribute-fields/TextAttributeField'
import BoolAttributeField from './attribute-fields/BoolAttributeField'
import PasswordAttributeField from './attribute-fields/PasswordAttributeField'
import StringAttributeField from './attribute-fields/StringAttributeField'
import LocaleAttributeField from './attribute-fields/LocaleAttributeField'
import MediaAttributeField from './attribute-fields/MediaAttributeField'
import LocationAttributeField from './attribute-fields/LocationAttributeField'
import EnumAttributeField from './attribute-fields/EnumAttributeField'
import './attribute-fields/AttributeField.css'
import ArrayAttributeField from './attribute-fields/ArrayAttributeField'
import {useCallback} from 'react'
import {
    ACCESS_ITEM_NAME,
    GROUP_MEMBER_ITEM_NAME,
    MASK_ATTR_NAME,
    ROLE_ITEM_NAME,
    USER_ITEM_NAME,
    USERNAME_ATTR_NAME
} from '../../config/constants'
import StringRelationAttributeField from './attribute-fields/StringRelationAttributeField'
import AccessMaskAttributeField from './attribute-fields/AccessMaskAttributeField'

const LOCALE_ATTR_NAME = 'locale'

const attributeFields: AttributeFields = {
    [AttrType.string]: StringAttributeField,
    [AttrType.uuid]: StringAttributeField,
    [AttrType.sequence]: StringAttributeField,
    [AttrType.email]: StringAttributeField,
    [AttrType.enum]: EnumAttributeField,
    [AttrType.password]: PasswordAttributeField,
    [AttrType.bool]: BoolAttributeField,
    [AttrType.text]: TextAttributeField,
    [AttrType.json]: JsonAttributeField,
    [AttrType.array]: ArrayAttributeField,
    [AttrType.int]: NumberAttributeField,
    [AttrType.long]: NumberAttributeField,
    [AttrType.float]: NumberAttributeField,
    [AttrType.double]: NumberAttributeField,
    [AttrType.decimal]: NumberAttributeField,
    [AttrType.date]: DateAttributeField,
    [AttrType.time]: TimeAttributeField,
    [AttrType.datetime]: DateTimeAttributeField,
    [AttrType.timestamp]: DateTimeAttributeField,
    [AttrType.media]: MediaAttributeField,
    [AttrType.location]: LocationAttributeField,
    [AttrType.relation]: RelationAttributeField
}

export default function AttributeFieldWrapper(props: AttributeFieldProps) {
    const {item, attrName, attribute} = props
    
    const getAttributeFieldComponent = useCallback(() => {
        if (attribute.type === AttrType.string && attrName === LOCALE_ATTR_NAME)
            return LocaleAttributeField

        if (item.name === ACCESS_ITEM_NAME && attrName === MASK_ATTR_NAME)
            return AccessMaskAttributeField
        
        return attributeFields[attribute.type]
    }, [attrName, attribute.type, item.name])

    if ((item.name === ROLE_ITEM_NAME || item.name === GROUP_MEMBER_ITEM_NAME) && attrName === USERNAME_ATTR_NAME)
        return <StringRelationAttributeField {...props} target={USER_ITEM_NAME}/>

    const AttributeFieldComponent = getAttributeFieldComponent()
    if (!AttributeFieldComponent)
        throw new Error('Illegal attribute')

    return <AttributeFieldComponent {...props}/>
}