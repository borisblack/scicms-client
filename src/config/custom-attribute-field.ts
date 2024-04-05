import {CustomAttributeField} from 'src/extensions/custom-attribute-fields'
import {accessMask} from 'src/extensions/custom-attribute-fields/access-mask'
import {locale} from 'src/extensions/custom-attribute-fields/locale'
import {mediaFile} from 'src/extensions/custom-attribute-fields/media-file'
import {userRelated} from 'src/extensions/custom-attribute-fields/user-related'
import {icon} from 'src/extensions/custom-attribute-fields/icon'

interface CustomAttributeFieldConfig {
    attributeFields: CustomAttributeField[]
}

// Add custom attribute fields here
const customAttributeFieldConfig: CustomAttributeFieldConfig = {
  attributeFields: [
    accessMask,
    icon,
    locale,
    mediaFile,
    userRelated
  ]
}

export default customAttributeFieldConfig