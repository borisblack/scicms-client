import type {FC} from 'react'

import type {PropertyValueProps} from './types'
import {FieldType} from 'src/types'
import {StringPropertyValue} from './StringPropertyValue'
import {BoolPropertyValue} from './BoolPropertyValue'
import {TextPropertyValue} from './TextPropertyValue'
import {JsonPropertyValue} from './JsonPropertyValue'
import {ArrayPropertyValue} from './ArrayPropertyValue'
import {NumberPropertyValue} from './NumberPropertyValue'
import {DatePropertyValue} from './DatePropertyValue'
import {TimePropertyValue} from './TimePropertyValue'
import {DateTimePropertyValue} from './DateTimePropertyValue'

const propertyValueComponents: Record<string, FC<PropertyValueProps>> = {
  [FieldType.string]: StringPropertyValue,
  [FieldType.uuid]: StringPropertyValue,
  [FieldType.email]: StringPropertyValue,
  [FieldType.bool]: BoolPropertyValue,
  [FieldType.text]: TextPropertyValue,
  [FieldType.json]: JsonPropertyValue,
  [FieldType.array]: ArrayPropertyValue,
  [FieldType.int]: NumberPropertyValue,
  [FieldType.long]: NumberPropertyValue,
  [FieldType.float]: NumberPropertyValue,
  [FieldType.double]: NumberPropertyValue,
  [FieldType.decimal]: NumberPropertyValue,
  [FieldType.date]: DatePropertyValue,
  [FieldType.time]: TimePropertyValue,
  [FieldType.datetime]: DateTimePropertyValue,
  [FieldType.timestamp]: DateTimePropertyValue
}

export function PropertyValue(props: PropertyValueProps) {
  const PropertyValueComponent = propertyValueComponents[props.type]
  if (!PropertyValueComponent) return null

  return <PropertyValueComponent {...props} />
}
