import {FC} from 'react'
import {Form} from 'antd'

import {FieldType} from 'src/types'
import {SOURCE_TYPE_ATTR_NAME, PASSWORD_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import PasswordAttributeField from 'src/pages/app/attributeFields/PasswordAttributeField'
import {DatasourceType} from 'src/types/schema'

export const DatasourcePasswordAttributeField: FC<CustomAttributeFieldContext> = (ctx) => {
  const {form, attrName, attribute} = ctx
  if (attrName !== PASSWORD_ATTR_NAME || attribute.type !== FieldType.password)
    throw new Error('Illegal attribute')

  const sourceType = Form.useWatch(SOURCE_TYPE_ATTR_NAME, form)

  return <PasswordAttributeField {...ctx} attribute={{...attribute, readOnly: sourceType !== DatasourceType.DATABASE}}/>
}
