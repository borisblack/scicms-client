import {CustomAttributeField} from '../index'
import {ICON_ATTR_NAME} from '../../../config/constants'
import IconAttributeField from './IconAttributeField'
import {FieldType} from '../../../types'

const ATTRIBUTE_FIELD_ID = 'icon'

export const icon: CustomAttributeField = {
    id: ATTRIBUTE_FIELD_ID,
    supports: (itemName, attrName, attribute) =>
        attrName === ICON_ATTR_NAME && attribute.type === FieldType.string,
    render: ({context}) => <IconAttributeField {...context}/>
}
