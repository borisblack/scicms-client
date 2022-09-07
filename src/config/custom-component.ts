import {CustomComponent} from '../custom-components'
import {itemAttributes} from '../custom-components/attributes/item-attributes'
import {itemTemplateAttributes} from '../custom-components/attributes/item-template-attributes'

interface CustomComponentConfig {
    components: CustomComponent[]
}

// Add custom components here
const customComponentConfig: CustomComponentConfig = {
    components: [
        itemAttributes,
        itemTemplateAttributes
    ]
}

export default customComponentConfig