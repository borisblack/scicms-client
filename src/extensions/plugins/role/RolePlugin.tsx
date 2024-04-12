import {ROLE_ITEM_NAME, USERNAME_ATTR_NAME, USER_ITEM_NAME} from 'src/config/constants'
import StringRelationAttributeField from 'src/pages/app/attributeFields/StringRelationAttributeField'
import {Plugin} from '../Plugin'

const ROLE_USERNAME_ATTRIBUTE_FIELD_ID = 'roleUsername'

export class RolePlugin extends Plugin {
  override onLoad(): void {
    this.addAttributeField({
      id: ROLE_USERNAME_ATTRIBUTE_FIELD_ID,
      supports: (itemName, attrName) => attrName === USERNAME_ATTR_NAME && itemName === ROLE_ITEM_NAME,
      render: ({context}) => <StringRelationAttributeField {...context} target={USER_ITEM_NAME}/>
    })
  }

  override onUnload(): void {
    throw new Error('Method not implemented.')
  }
  
}