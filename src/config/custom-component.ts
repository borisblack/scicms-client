import {CustomComponent} from '../custom-components'
import {itemAttributes} from '../custom-components/attributes/item-attributes'
import {itemTemplateAttributes} from '../custom-components/attributes/item-template-attributes'
import {itemIndexes} from '../custom-components/indexes/item-indexes'
import {itemTemplateIndexes} from '../custom-components/indexes/item-template-indexes'

interface CustomComponentConfig {
    components: CustomComponent[]
}

// Add custom components here
const customComponentConfig: CustomComponentConfig = {
    components: [
        itemAttributes,
        itemTemplateAttributes,
        itemIndexes,
        itemTemplateIndexes
    ]
}

export default customComponentConfig