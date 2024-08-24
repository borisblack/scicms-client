import {FC} from 'react'
import {Form} from 'antd'

import {FieldType} from 'src/types'
import {IS_FILE_NAME, MIN_IDLE_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import NumberAttributeField from 'src/pages/app/attributeFields/NumberAttributeField'

export const MinIdleAttributeField: FC<CustomAttributeFieldContext> = (ctx) => {
  const {form, attrName, attribute} = ctx
  if (attrName !== MIN_IDLE_ATTR_NAME || attribute.type !== FieldType.int)
    throw new Error('Illegal attribute')

  const isFile = Form.useWatch(IS_FILE_NAME, form)

  return <NumberAttributeField {...ctx} attribute={{...attribute, readOnly: isFile}}/>
}
