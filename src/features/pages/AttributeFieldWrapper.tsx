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
    const {attrName, attribute} = props

    const AttributeFieldComponent = (attribute.type === AttrType.string && attrName === LOCALE_ATTR_NAME) ? LocaleAttributeField : attributeFields[attribute.type]
    if (!AttributeFieldComponent)
        throw new Error('Illegal attribute')

    return <AttributeFieldComponent {...props}/>
}