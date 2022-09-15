import {CustomComponent} from '../custom-components'
import {itemAttributes} from '../custom-components/item/attributes/item-attributes'
import {itemTemplateAttributes} from '../custom-components/item/attributes/item-template-attributes'
import {itemIndexes} from '../custom-components/item/indexes/item-indexes'
import {itemTemplateIndexes} from '../custom-components/item/indexes/item-template-indexes'
import {userRoles} from '../custom-components/user/user-roles/user-roles'
// import {userGroups} from '../custom-components/user/user-groups/user-groups'

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
        userRoles,
        // userGroups, // owner is a group
    ]
}

export default customComponentConfig