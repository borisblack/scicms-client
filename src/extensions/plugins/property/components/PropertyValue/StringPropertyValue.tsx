import type {ChangeEvent, FC} from 'react'
import {useCallback} from 'react'
import {Input} from 'antd'

import type {PropertyValueProps} from './types'
import {FieldType} from 'src/types'

export const StringPropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  if (type !== FieldType.string && type !== FieldType.uuid && type !== FieldType.email)
    throw new Error('Illegal type.')

  const handleChange = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    onChange(evt.target.value)
  }, [onChange])

  return (
    <Input
      value={value ?? undefined}
      disabled={!canEdit}
      onChange={handleChange}
    />
  )
}
