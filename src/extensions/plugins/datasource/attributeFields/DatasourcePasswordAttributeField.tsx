import {FC} from 'react'
import {Form} from 'antd'

import {FieldType} from 'src/types'
import {IS_FILE_NAME, PASSWORD_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import PasswordAttributeField from 'src/pages/app/attributeFields/PasswordAttributeField'

export const DatasourcePasswordAttributeField: FC<CustomAttributeFieldContext> = (ctx) => {
  const {form, attrName, attribute} = ctx
  if (attrName !== PASSWORD_ATTR_NAME || attribute.type !== FieldType.password)
    throw new Error('Illegal attribute')

  const isFile = Form.useWatch(IS_FILE_NAME, form)

  return <PasswordAttributeField {...ctx} attribute={{...attribute, readOnly: isFile}}/>
}
