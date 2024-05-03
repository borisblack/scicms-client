import type {ChangeEvent, FC} from 'react'
import {useCallback, useMemo} from 'react'
import {Input} from 'antd'

import {FieldType} from 'src/types'
import appConfig from 'src/config'
import {PropertyValueProps} from './types'

const {TextArea} = Input

export const ArrayPropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  if (type !== FieldType.array)
    throw new Error('Illegal type.')

  const parsedValue = useMemo((): string[] | undefined => {
    if (value == null)
      return undefined

    const arr = JSON.parse(value)
    if (!Array.isArray(arr))
      return undefined

    return arr
  }, [value])

  const handleChange = useCallback((evt: ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target.value
    onChange(val ? val : undefined)
  }, [onChange])

  return (
    <TextArea
      value={parsedValue}
      rows={appConfig.ui.form.textAreaRows}
      disabled={!canEdit}
      onChange={handleChange}
    />
  )
}
