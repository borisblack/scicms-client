import {CustomAttributeField} from '../index'
import {LOCALE_ATTR_NAME} from '../../config/constants'
import LocaleAttributeField from './LocaleAttributeField'
import {FieldType} from '../../types'

const ATTRIBUTE_FIELD_ID = 'locale'

export const locale: CustomAttributeField = {
    id: ATTRIBUTE_FIELD_ID,
    supports: (itemName, attrName, attribute) => attrName === LOCALE_ATTR_NAME && attribute.type === FieldType.string,
    priority: 10,
    render: ({context}) => <LocaleAttributeField key={ATTRIBUTE_FIELD_ID} {...context}/>
}
