import type {FC} from 'react'
import {useCallback, useMemo} from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {DatePicker} from 'antd'

import {FieldType} from 'src/types'
import {PropertyValueProps} from './types'
import {useAppProperties} from 'src/util/hooks'

dayjs.extend(utc)

export const DatePropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  const appProps = useAppProperties()
  const {momentDisplayDateFormatString} = appProps.dateTime

  if (type !== FieldType.date)
    throw new Error('Illegal type')

  const parsedValue = useMemo(() => value == null ? undefined : dayjs.utc(value), [value])

  const handleChange = useCallback((val: dayjs.Dayjs | null) => {
    onChange(val == null ? undefined : val.format())
  }, [onChange])

  return (
    <DatePicker
      value={parsedValue}
      format={momentDisplayDateFormatString}
      disabled={!canEdit}
      onChange={handleChange}
    />
  )
}
