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
import MediaAttributeField from './attribute-fields/MediaAttributeField'
import EnumAttributeField from './attribute-fields/EnumAttributeField'
import './attribute-fields/AttributeField.css'
import ArrayAttributeField from './attribute-fields/ArrayAttributeField'
import {renderAttributeField} from '../../extensions/custom-attribute-fields'

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
    const AttributeFieldComponent = attributeFields[props.attribute.type]
    if (!AttributeFieldComponent)
        throw new Error('Illegal attribute')

    return renderAttributeField({...props}, AttributeFieldComponent)
}