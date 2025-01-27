import {ICON_ATTR_NAME, LOCALE_ATTR_NAME} from 'src/config/constants'
import {Plugin} from '../Plugin'
import {IconAttributeField, LocaleAttributeField} from './attributeFields'

const ICON_ATTRIBUTE_FIELD_ID = 'icon'
const LOCALE_ATTRIBUTE_FIELD_ID = 'locale'

export class CommonPlugin extends Plugin {
  override onLoad(): void {
    // Attribute fields
    this.addAttributeField({
      id: ICON_ATTRIBUTE_FIELD_ID,
      mountPoint: `*.${ICON_ATTR_NAME}`,
      render: ({context}) => <IconAttributeField {...context} />
    })

    this.addAttributeField({
      id: LOCALE_ATTRIBUTE_FIELD_ID,
      mountPoint: `*.${LOCALE_ATTR_NAME}`,
      render: ({context}) => <LocaleAttributeField {...context} />
    })
  }

  override onUnload(): void {
    throw new Error('Method not implemented.')
  }
}
