import {CustomAttributeField} from '../index'
import {ACCESS_ITEM_NAME, MASK_ATTR_NAME} from '../../config/constants'
import AccessMaskAttributeField from './AccessMaskAttributeField'

const COMPONENT_ID = 'accessMask'

export const accessMask: CustomAttributeField = {
    id: COMPONENT_ID,
    supports: (itemName, attrName, attribute) => attrName === MASK_ATTR_NAME && itemName === ACCESS_ITEM_NAME,
    priority: 10,
    render: ({context}) => <AccessMaskAttributeField key={COMPONENT_ID} {...context}/>
}
