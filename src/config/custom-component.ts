import {CustomComponent} from '../extensions/custom-components'
import {itemAttributes} from '../extensions/custom-components/item/attributes/item-attributes'
import {itemTemplateAttributes} from '../extensions/custom-components/item/attributes/item-template-attributes'
import {itemIndexes} from '../extensions/custom-components/item/indexes/item-indexes'
import {itemTemplateIndexes} from '../extensions/custom-components/item/indexes/item-template-indexes'
import {userRoles} from '../extensions/custom-components/user/user-roles/user-roles'
import {lifecycleSpec} from '../extensions/custom-components/lifecycle/spec/lifecycle-spec'
import {datasetColumns} from '../extensions/custom-components/dataset/columns/dataset-columns'
import {dashboardSpec} from '../extensions/custom-components/dashboard/spec/dashboard-spec'
import {dashboardPreview} from '../extensions/custom-components/dashboard/preview/dashboard-preview'
import {userGroups} from '../extensions/custom-components/user/user-groups/user-groups'

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
        lifecycleSpec,
        datasetColumns,
        dashboardSpec,
        // dashboardPreview,
        userGroups // owner is a group
    ]
}

export default customComponentConfig