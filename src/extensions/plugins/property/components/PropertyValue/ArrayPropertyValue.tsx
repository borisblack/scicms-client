import type {ChangeEvent, FC} from 'react'
import {useCallback, useMemo} from 'react'
import {Input} from 'antd'

import {FieldType} from 'src/types'
import {PropertyValueProps} from './types'
import {useAppProperties} from 'src/util/hooks'

const {TextArea} = Input

export const ArrayPropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  const appProps = useAppProperties()
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
      rows={appProps.ui.form.textAreaRows}
      disabled={!canEdit}
      onChange={handleChange}
    />
  )
}
