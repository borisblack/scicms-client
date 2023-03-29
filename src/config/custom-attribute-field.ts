import {CustomAttributeField} from '../extensions/custom-attribute-fields'
import {accessMask} from '../extensions/custom-attribute-fields/access-mask'
import {locale} from '../extensions/custom-attribute-fields/locale'
import {mediaFile} from '../extensions/custom-attribute-fields/media-file'
import {userRelated} from '../extensions/custom-attribute-fields/user-related'

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