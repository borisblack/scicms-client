import {FieldType} from '../../types'
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
import EnumAttributeField from './attribute-fields/EnumAttributeField'
import './attribute-fields/AttributeField.css'
import ArrayAttributeField from './attribute-fields/ArrayAttributeField'
import {useCallback} from 'react'
import {
    ACCESS_ITEM_NAME,
    FILENAME_ATTR_NAME,
    GROUP_MEMBER_ITEM_NAME,
    LOCALE_ATTR_NAME,
    MASK_ATTR_NAME,
    MEDIA_ITEM_NAME,
    ROLE_ITEM_NAME,
    USER_ITEM_NAME,
    USERNAME_ATTR_NAME
} from '../../config/constants'
import StringRelationAttributeField from './attribute-fields/StringRelationAttributeField'
import AccessMaskAttributeField from './attribute-fields/AccessMaskAttributeField'
import MediaFileAttributeField from './attribute-fields/MediaFileAttributeField'

const attributeFields: AttributeFields = {
    [FieldType.string]: StringAttributeField,
    [FieldType.uuid]: StringAttributeField,
    [FieldType.sequence]: StringAttributeField,
    [FieldType.email]: StringAttributeField,
    [FieldType.enum]: EnumAttributeField,
    [FieldType.password]: PasswordAttributeField,
    [FieldType.bool]: BoolAttributeField,
    [FieldType.text]: TextAttributeField,
    [FieldType.json]: JsonAttributeField,
    [FieldType.array]: ArrayAttributeField,
    [FieldType.int]: NumberAttributeField,
    [FieldType.long]: NumberAttributeField,
    [FieldType.float]: NumberAttributeField,
    [FieldType.double]: NumberAttributeField,
    [FieldType.decimal]: NumberAttributeField,
    [FieldType.date]: DateAttributeField,
    [FieldType.time]: TimeAttributeField,
    [FieldType.datetime]: DateTimeAttributeField,
    [FieldType.timestamp]: DateTimeAttributeField,
    [FieldType.media]: MediaAttributeField,
    [FieldType.relation]: RelationAttributeField
}

export default function AttributeFieldWrapper(props: AttributeFieldProps) {
    const {item, attrName, attribute} = props

    const getAttributeFieldComponent = useCallback(() => {
        if (attrName === LOCALE_ATTR_NAME && attribute.type === FieldType.string)
            return LocaleAttributeField

        if (attrName === FILENAME_ATTR_NAME && item.name === MEDIA_ITEM_NAME)
            return MediaFileAttributeField

        if (attrName === MASK_ATTR_NAME && item.name === ACCESS_ITEM_NAME)
            return AccessMaskAttributeField

        return attributeFields[attribute.type]
    }, [attrName, attribute.type, item.name])

    if (attrName === USERNAME_ATTR_NAME && (item.name === ROLE_ITEM_NAME || item.name === GROUP_MEMBER_ITEM_NAME))
        return <StringRelationAttributeField {...props} target={USER_ITEM_NAME}/>

    const AttributeFieldComponent = getAttributeFieldComponent()
    if (!AttributeFieldComponent)
        throw new Error('Illegal attribute')

    return <AttributeFieldComponent {...props}/>
}