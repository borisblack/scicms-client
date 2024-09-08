import {FC} from 'react'
import {Form} from 'antd'

import {FieldType} from 'src/types'
import {SOURCE_TYPE_ATTR_NAME, USERNAME_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import StringAttributeField from 'src/pages/app/attributeFields/StringAttributeField'
import {DatasourceType} from 'src/types/schema'

export const UsernameAttributeField: FC<CustomAttributeFieldContext> = (ctx) => {
  const {form, attrName, attribute} = ctx
  if (attrName !== USERNAME_ATTR_NAME || attribute.type !== FieldType.string)
    throw new Error('Illegal attribute')

  const sourceType = Form.useWatch(SOURCE_TYPE_ATTR_NAME, form)

  return <StringAttributeField {...ctx} attribute={{...attribute, readOnly: sourceType !== DatasourceType.DATABASE}}/>
}
