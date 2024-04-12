import {ICON_ATTR_NAME, LOCALE_ATTR_NAME} from 'src/config/constants'
import {FieldType} from 'src/types'
import {Plugin} from '../Plugin'
import {IconAttributeField, LocaleAttributeField} from './attributeFields'

const ICON_ATTRIBUTE_FIELD_ID = 'icon'
const LOCALE_ATTRIBUTE_FIELD_ID = 'locale'

export class CommonPlugin extends Plugin {
  override onLoad(): void {
    this.addAttributeField({
      id: ICON_ATTRIBUTE_FIELD_ID,
      supports: (itemName, attrName, attribute) =>
        attrName === ICON_ATTR_NAME && attribute.type === FieldType.string,
      render: ({context}) => <IconAttributeField {...context}/>
    })

    this.addAttributeField({
      id: LOCALE_ATTRIBUTE_FIELD_ID,
      supports: (itemName, attrName, attribute) =>
        attrName === LOCALE_ATTR_NAME && attribute.type === FieldType.string,
      render: ({context}) => <LocaleAttributeField {...context}/>
    })
  }

  override onUnload(): void {
    throw new Error('Method not implemented.')
  }
}