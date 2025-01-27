import {FC} from 'react'
import {Form} from 'antd'

import {FieldType} from 'src/types'
import {SOURCE_TYPE_ATTR_NAME, MEDIA_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import MediaAttributeField from 'src/pages/app/attributeFields/MediaAttributeField'
import {DatasourceType} from 'src/types/schema'

export const DatasourceMediaAttributeField: FC<CustomAttributeFieldContext> = ctx => {
  const {form, attrName, attribute} = ctx
  if (attrName !== MEDIA_ATTR_NAME || attribute.type !== FieldType.media) throw new Error('Illegal attribute')

  const sourceType = Form.useWatch(SOURCE_TYPE_ATTR_NAME, form)

  return <MediaAttributeField {...ctx} attribute={{...attribute, readOnly: sourceType === DatasourceType.DATABASE}} />
}
