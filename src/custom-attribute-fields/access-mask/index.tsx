import {CustomAttributeField} from '../index'
import {ACCESS_ITEM_NAME, MASK_ATTR_NAME} from '../../config/constants'
import AccessMaskAttributeField from './AccessMaskAttributeField'

const ATTRIBUTE_FIELD_ID = 'accessMask'

export const accessMask: CustomAttributeField = {
    id: ATTRIBUTE_FIELD_ID,
    supports: (itemName, attrName, attribute) => attrName === MASK_ATTR_NAME && itemName === ACCESS_ITEM_NAME,
    priority: 10,
    render: ({context}) => <AccessMaskAttributeField {...context}/>
}
