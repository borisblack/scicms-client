import {FC} from 'react'

import {FieldType} from 'src/types'
import {PASSWORD_ATTR_NAME, SOURCE_TYPE_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import EnumAttributeField from 'src/pages/app/attributeFields/EnumAttributeField'
import {DatasourceType} from 'src/types/schema'

export const SourceTypeAttributeField: FC<CustomAttributeFieldContext> = ctx => {
  const {form, attrName, attribute, onChange} = ctx
  if (attrName !== SOURCE_TYPE_ATTR_NAME || attribute.type !== FieldType.enum) throw new Error('Illegal attribute')

  function handleChange(val: string) {
    if (val !== DatasourceType.DATABASE) form.setFieldValue(PASSWORD_ATTR_NAME, undefined)

    onChange(val)
  }

  return <EnumAttributeField {...ctx} onChange={handleChange} />
}
