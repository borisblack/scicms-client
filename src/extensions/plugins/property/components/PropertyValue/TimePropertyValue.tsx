import type {FC} from 'react'
import type {Dayjs} from 'dayjs'
import {useCallback, useMemo} from 'react'
import {TimePicker} from 'antd'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'

import type {PropertyValueProps} from './types'
import {FieldType} from 'src/types'
import {MOMENT_ISO_TIME_FORMAT_STRING, UTC} from 'src/config/constants'
import {useAppProperties} from 'src/util/hooks'

dayjs.extend(timezone)

export const TimePropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  const appProps = useAppProperties()
  const {momentDisplayTimeFormatString} = appProps.dateTime

  if (type !== FieldType.time) throw new Error('Illegal type.')

  const parsedValue = useMemo(
    () => (value == null ? undefined : dayjs.tz(value, MOMENT_ISO_TIME_FORMAT_STRING, UTC)),
    [value]
  )

  const handleChange = useCallback(
    (val: Dayjs | null) => {
      onChange(val == null ? null : val.format(/*MOMENT_ISO_TIME_FORMAT_STRING*/))
    },
    [onChange]
  )

  return (
    <TimePicker
      value={parsedValue}
      format={momentDisplayTimeFormatString}
      showSecond={false}
      disabled={!canEdit}
      onChange={handleChange}
    />
  )
}
