import {GROUP_MEMBER_ITEM_NAME, USERNAME_ATTR_NAME, USER_ITEM_NAME} from 'src/config/constants'
import StringRelationAttributeField from 'src/pages/app/attributeFields/StringRelationAttributeField'
import {Plugin} from '../Plugin'

const GROUP_MEMBER_USERNAME_ATTRIBUTE_FIELD_ID = 'groupMemberUsername'

export class GroupMemberPlugin extends Plugin {
  override onLoad(): void {
    this.addAttributeField({
      id: GROUP_MEMBER_USERNAME_ATTRIBUTE_FIELD_ID,
      mountPoint: `${GROUP_MEMBER_ITEM_NAME}.${USERNAME_ATTR_NAME}`,
      render: ({context}) => <StringRelationAttributeField {...context} target={USER_ITEM_NAME}/>
    })
  }

  override onUnload(): void {
    throw new Error('Method not implemented.')
  }
  
}