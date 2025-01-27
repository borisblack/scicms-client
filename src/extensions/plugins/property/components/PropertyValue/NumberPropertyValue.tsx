import type {FC} from 'react'
import {useCallback} from 'react'
import {InputNumber} from 'antd'

import type {PropertyValueProps} from './types'
import {FieldType} from 'src/types'

export const NumberPropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  if (
    type !== FieldType.int &&
    type !== FieldType.long &&
    type !== FieldType.float &&
    type !== FieldType.double &&
    type !== FieldType.decimal
  ) {
    throw new Error('Illegal type.')
  }

  const handleChange = useCallback(
    (val: string | number | null) => {
      onChange(typeof val === 'number' ? val.toString() : val)
    },
    [onChange]
  )

  return <InputNumber value={value} disabled={!canEdit} onChange={handleChange} />
}
