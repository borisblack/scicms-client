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
import './AttributeInputWrapper.css'

const attributeFields: AttributeFields = {
    [AttrType.string]: StringAttributeField,
    [AttrType.uuid]: StringAttributeField,
    [AttrType.sequence]: StringAttributeField,
    [AttrType.email]: StringAttributeField,
    // [AttrType.enum]: null,
    [AttrType.password]: PasswordAttributeField,
    [AttrType.bool]: BoolAttributeField,
    [AttrType.text]: TextAttributeField,
    [AttrType.json]: JsonAttributeField,
    [AttrType.array]: JsonAttributeField,
    [AttrType.int]: NumberAttributeField,
    [AttrType.long]: NumberAttributeField,
    [AttrType.float]: NumberAttributeField,
    [AttrType.double]: NumberAttributeField,
    [AttrType.decimal]: NumberAttributeField,
    [AttrType.date]: DateAttributeField,
    [AttrType.time]: TimeAttributeField,
    [AttrType.datetime]: DateTimeAttributeField,
    [AttrType.timestamp]: DateTimeAttributeField,
    // [AttrType.media]: null,
    // [AttrType.location]: null
    [AttrType.relation]: RelationAttributeField
}

export default function AttributeFieldWrapper(props: AttributeFieldProps) {
    const {attribute} = props

    const AttributeFieldComponent = attributeFields[attribute.type]
    if (!AttributeFieldComponent) {
        // TODO: throw new Error('Illegal attribute')
        return null
    }

    return <AttributeFieldComponent {...props}/>
}