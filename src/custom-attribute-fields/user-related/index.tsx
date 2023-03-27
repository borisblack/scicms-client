import {CustomAttributeField} from '../index'
import {GROUP_MEMBER_ITEM_NAME, ROLE_ITEM_NAME, USER_ITEM_NAME, USERNAME_ATTR_NAME} from '../../config/constants'
import StringRelationAttributeField from '../StringRelationAttributeField'

const COMPONENT_ID = 'userRelated'

export const userRelated: CustomAttributeField = {
    id: COMPONENT_ID,
    supports: (itemName, attrName, attribute) => attrName === USERNAME_ATTR_NAME && (itemName === ROLE_ITEM_NAME || itemName === GROUP_MEMBER_ITEM_NAME),
    priority: 10,
    render: ({context}) => <StringRelationAttributeField key={COMPONENT_ID} {...context} target={USER_ITEM_NAME}/>
}
