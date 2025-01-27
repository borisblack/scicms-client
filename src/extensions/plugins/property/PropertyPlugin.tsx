import {PROPERTY_ITEM_NAME} from 'src/config/constants'
import {Plugin} from '../Plugin'
import {PropertyTypeAttributeField, PropertyValueAttributeField} from './attributeFields'

const PROPERTY_TYPE_ATTRIBUTE_FIELD_ID = 'propertyType'
const PROPERTY_VALUE_ATTRIBUTE_FIELD_ID = 'propertyValue'

export class PropertyPlugin extends Plugin {
  override onLoad(): void {
    // Attribute fields
    this.addAttributeField({
      id: PROPERTY_TYPE_ATTRIBUTE_FIELD_ID,
      mountPoint: `${PROPERTY_ITEM_NAME}.type`,
      render: ({context}) => <PropertyTypeAttributeField {...context} />
    })

    this.addAttributeField({
      id: PROPERTY_VALUE_ATTRIBUTE_FIELD_ID,
      mountPoint: `${PROPERTY_ITEM_NAME}.value`,
      render: ({context}) => <PropertyValueAttributeField {...context} />
    })
  }

  override onUnload(): void {
    throw new Error('Method not implemented.')
  }
}
