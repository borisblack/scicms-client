import type {FC} from 'react'
import {useCallback, useMemo} from 'react'
import {Switch} from 'antd'

import {FieldType} from 'src/types'
import {PropertyValueProps} from './types'

export const BoolPropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  if (type !== FieldType.bool) throw new Error('Illegal type.')

  const parsedValue = useMemo(() => {
    if (!value || value === '0' || value === 'false') return false

    return true
  }, [value])

  const handleChange = useCallback(
    (checked: boolean) => {
      onChange(checked ? '1' : '0')
    },
    [onChange]
  )

  return <Switch checked={parsedValue} disabled={!canEdit} onChange={handleChange} />
}
