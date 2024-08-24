import {FC} from 'react'
import {Form} from 'antd'

import {FieldType} from 'src/types'
import {CONNNECTION_STRING_ATTR_NAME, IS_FILE_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import StringAttributeField from 'src/pages/app/attributeFields/StringAttributeField'

export const ConnectionStringAttributeField: FC<CustomAttributeFieldContext> = (ctx) => {
  const {form, attrName, attribute} = ctx
  if (attrName !== CONNNECTION_STRING_ATTR_NAME || attribute.type !== FieldType.string)
    throw new Error('Illegal attribute')

  const isFile = Form.useWatch(IS_FILE_NAME, form)

  return <StringAttributeField {...ctx} attribute={{...attribute, readOnly: isFile}}/>
}
