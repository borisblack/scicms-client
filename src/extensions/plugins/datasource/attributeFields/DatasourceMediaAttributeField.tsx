import {FC} from 'react'
import {Form} from 'antd'

import {FieldType} from 'src/types'
import {IS_FILE_NAME, MEDIA_ATTR_NAME} from 'src/config/constants'
import {CustomAttributeFieldContext} from '../../types'
import MediaAttributeField from 'src/pages/app/attributeFields/MediaAttributeField'

export const DatasourceMediaAttributeField: FC<CustomAttributeFieldContext> = (ctx) => {
  const {form, attrName, attribute} = ctx
  if (attrName !== MEDIA_ATTR_NAME || attribute.type !== FieldType.media)
    throw new Error('Illegal attribute')

  const isFile = Form.useWatch(IS_FILE_NAME, form)

  return <MediaAttributeField {...ctx} attribute={{...attribute, readOnly: !isFile}}/>
}
