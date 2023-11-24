import {CustomAttributeField} from '../extensions/custom-attribute-fields'
import {accessMask} from '../extensions/custom-attribute-fields/access-mask'
import {datasource} from '../extensions/custom-attribute-fields/datasource'
import {locale} from '../extensions/custom-attribute-fields/locale'
import {mediaFile} from '../extensions/custom-attribute-fields/media-file'
import {userRelated} from '../extensions/custom-attribute-fields/user-related'
import {icon} from '../extensions/custom-attribute-fields/icon'

interface CustomAttributeFieldConfig {
    attributeFields: CustomAttributeField[]
}

// Add custom attribute fields here
const customAttributeFieldConfig: CustomAttributeFieldConfig = {
    attributeFields: [
        accessMask,
        datasource,
        icon,
        locale,
        mediaFile,
        userRelated
    ]
}

export default customAttributeFieldConfig