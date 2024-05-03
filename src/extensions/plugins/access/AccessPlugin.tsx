import {ACCESS_ITEM_NAME, MASK_ATTR_NAME} from 'src/config/constants'
import {Plugin} from '../Plugin'
import {AccessMaskAttributeField} from './attributeFields'

const ACCESS_MASK_ATTRIBUTE_FIELD_ID = 'accessMask'

export class AccessPlugin extends Plugin {
  override onLoad(): void {
    this.addAttributeField({
      id: ACCESS_MASK_ATTRIBUTE_FIELD_ID,
      mountPoint: `${ACCESS_ITEM_NAME}.${MASK_ATTR_NAME}`,
      render: ({context}) => <AccessMaskAttributeField {...context}/>
    })
  }

  override onUnload(): void {
    throw new Error('Method not implemented.')
  }
}