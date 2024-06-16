import type {FC} from 'react'
import {useCallback, useMemo} from 'react'
import {DatePicker} from 'antd'
import type {Dayjs} from 'dayjs'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'

import {FieldType} from 'src/types'
import {UTC} from 'src/config/constants'
import {PropertyValueProps} from './types'
import {useAppProperties} from 'src/util/hooks'

dayjs.extend(timezone)

export const DateTimePropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  const appProps = useAppProperties()
  const {momentDisplayDateTimeFormatString} = appProps.dateTime

  if (type !== FieldType.datetime && type !== FieldType.timestamp)
    throw new Error('Illegal type.')

  const parsedValue = useMemo(() => value == null ? undefined : dayjs.tz(value, UTC), [value])

  const handleChange = useCallback((val: Dayjs | null) => {
    onChange(val == null ? null : val.format())
  }, [onChange])

  return (
    <DatePicker
      value={parsedValue}
      showTime
      showSecond={false}
      format={momentDisplayDateTimeFormatString}
      disabled={!canEdit}
      onChange={handleChange}
    />
  )
}
