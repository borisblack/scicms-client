import {CustomAttributeField} from '../custom-attribute-fields'
import {accessMask} from '../custom-attribute-fields/access-mask'
import {locale} from '../custom-attribute-fields/locale'
import {mediaFile} from '../custom-attribute-fields/media-file'
import {userRelated} from '../custom-attribute-fields/user-related'

interface CustomAttributeFieldConfig {
    attributeFields: CustomAttributeField[]
}

// Add custom attribute fields here
const customAttributeFieldConfig: CustomAttributeFieldConfig = {
    attributeFields: [
        accessMask,
        locale,
        mediaFile,
        userRelated
    ]
}

export default customAttributeFieldConfig