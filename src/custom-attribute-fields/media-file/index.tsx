import {CustomAttributeField} from '../index'
import {FILENAME_ATTR_NAME, MEDIA_ITEM_NAME} from '../../config/constants'
import MediaFileAttributeField from './MediaFileAttributeField'

const COMPONENT_ID = 'mediaFile'

export const mediaFile: CustomAttributeField = {
    id: COMPONENT_ID,
    supports: (itemName, attrName, attribute) => attrName === FILENAME_ATTR_NAME && itemName === MEDIA_ITEM_NAME,
    priority: 10,
    render: ({context}) => <MediaFileAttributeField key={COMPONENT_ID} {...context}/>
}
