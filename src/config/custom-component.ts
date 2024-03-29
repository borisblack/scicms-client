import {CustomComponent} from '../extensions/custom-components'
import {itemAttributes} from '../extensions/custom-components/item/attributes/item-attributes'
import {itemTemplateAttributes} from '../extensions/custom-components/item/attributes/item-template-attributes'
import {itemIndexes} from '../extensions/custom-components/item/indexes/item-indexes'
import {itemTemplateIndexes} from '../extensions/custom-components/item/indexes/item-template-indexes'
import {userRoles} from '../extensions/custom-components/user/user-roles/user-roles'
import {lifecycleSpec} from '../extensions/custom-components/lifecycle/spec/lifecycle-spec'
import {datasetSources} from '../extensions/custom-components/dataset/sources/dataset-sources'
import {datasetFields} from '../extensions/custom-components/dataset/fields/dataset-fields'
import {dashboardSpec} from '../extensions/custom-components/dashboard/spec/dashboard-spec'
import {userGroups} from '../extensions/custom-components/user/user-groups/user-groups'
import {projectGantt} from '../extensions/custom-components/project/gantt/project-gantt'

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
        datasetSources,
        datasetFields,
        dashboardSpec,
        userGroups, // owner is a group

        projectGantt
    ]
}

export default customComponentConfig