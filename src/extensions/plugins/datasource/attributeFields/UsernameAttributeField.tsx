import {FC} from 'react'
import {Form} from 'antd'

import {FieldType} from 'src/types'
import {IS_FILE_NAME, USERNAME_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import StringAttributeField from 'src/pages/app/attributeFields/StringAttributeField'

export const UsernameAttributeField: FC<CustomAttributeFieldContext> = (ctx) => {
  const {form, attrName, attribute} = ctx
  if (attrName !== USERNAME_ATTR_NAME || attribute.type !== FieldType.string)
    throw new Error('Illegal attribute')

  const isFile = Form.useWatch(IS_FILE_NAME, form)

  return <StringAttributeField {...ctx} attribute={{...attribute, readOnly: isFile}}/>
}
