import {CustomAttributeField} from '../index'
import {DATA_SOURCE_ATTR_NAME} from '../../../config/constants'
import DataSourceAttributeField from './DataSourceAttributeField'
import {FieldType} from '../../../types'

const ATTRIBUTE_FIELD_ID = 'datasource'

export const datasource: CustomAttributeField = {
    id: ATTRIBUTE_FIELD_ID,
    supports: (itemName, attrName, attribute) => attrName === DATA_SOURCE_ATTR_NAME && attribute.type === FieldType.string,
    render: ({context}) => <DataSourceAttributeField {...context}/>
}
