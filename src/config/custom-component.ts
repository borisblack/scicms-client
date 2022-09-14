import {CustomComponent} from '../custom-components'
import {itemAttributes} from '../custom-components/item/attributes/item-attributes'
import {itemTemplateAttributes} from '../custom-components/item/attributes/item-template-attributes'
import {itemIndexes} from '../custom-components/item/indexes/item-indexes'
import {itemTemplateIndexes} from '../custom-components/item/indexes/item-template-indexes'
import {groupMemberUser} from '../custom-components/group-member/group-member-user/group-member-user'
import {userRoles} from '../custom-components/user/user-roles/user-roles'
// import {userGroups} from '../custom-components/user/user-groups/user-groups'
import {roleUser} from '../custom-components/role/role-user/role-user'
import {accessMask} from '../custom-components/access/access-mask/access-mask'

interface CustomComponentConfig {
    components: CustomComponent[]
}

// Add custom components here
const customComponentConfig: CustomComponentConfig = {
    components: [
        itemAttributes,
        itemTemplateAttributes,
        itemIndexes,
        itemTemplateIndexes,
        groupMemberUser,
        userRoles,
        // userGroups, // owner is a group
        roleUser,
        accessMask
    ]
}

export default customComponentConfig