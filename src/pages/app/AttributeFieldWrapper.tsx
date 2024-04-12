import {FieldType} from '../../types'
import {AttributeFieldProps, AttributeFields} from './attributeFields'
import RelationAttributeField from './attributeFields/RelationAttributeField'
import DateTimeAttributeField from './attributeFields/DateTimeAttributeField'
import TimeAttributeField from './attributeFields/TimeAttributeField'
import DateAttributeField from './attributeFields/DateAttributeField'
import NumberAttributeField from './attributeFields/NumberAttributeField'
import JsonAttributeField from './attributeFields/JsonAttributeField'
import TextAttributeField from './attributeFields/TextAttributeField'
import BoolAttributeField from './attributeFields/BoolAttributeField'
import PasswordAttributeField from './attributeFields/PasswordAttributeField'
import StringAttributeField from './attributeFields/StringAttributeField'
import MediaAttributeField from './attributeFields/MediaAttributeField'
import EnumAttributeField from './attributeFields/EnumAttributeField'
import ArrayAttributeField from './attributeFields/ArrayAttributeField'
import {pluginEngine} from 'src/extensions/plugins'
import './attributeFields/AttributeField.css'

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

  return pluginEngine.renderAttributeField({...props}, AttributeFieldComponent)
}