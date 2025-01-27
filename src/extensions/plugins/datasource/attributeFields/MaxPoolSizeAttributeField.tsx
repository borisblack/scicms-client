import {FC} from 'react'
import {Form} from 'antd'

import {FieldType} from 'src/types'
import {SOURCE_TYPE_ATTR_NAME, MAX_POOL_SIZE_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import NumberAttributeField from 'src/pages/app/attributeFields/NumberAttributeField'
import {DatasourceType} from 'src/types/schema'

export const MaxPoolSizeAttributeField: FC<CustomAttributeFieldContext> = ctx => {
  const {form, attrName, attribute} = ctx
  if (attrName !== MAX_POOL_SIZE_ATTR_NAME || attribute.type !== FieldType.int) throw new Error('Illegal attribute')

  const sourceType = Form.useWatch(SOURCE_TYPE_ATTR_NAME, form)

  return <NumberAttributeField {...ctx} attribute={{...attribute, readOnly: sourceType !== DatasourceType.DATABASE}} />
}
