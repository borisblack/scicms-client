import {DatePicker, Space, TimePicker} from 'antd'
import {AttrType, TemporalType} from '../types'
import {useTranslation} from 'react-i18next'
import {Moment} from 'moment-timezone'
import {DateTime} from 'luxon'
import appConfig from '../config'
import {useCallback} from 'react'

interface Props {
    temporalType: TemporalType
    onStartTemporalChange: (startTemporal: string | null) => void
    onEndTemporalChange: (endTemporal: string | null) => void
}

export default function TemporalToolbar({temporalType, onStartTemporalChange, onEndTemporalChange}: Props) {
    const {t} = useTranslation()

    const parseTemporal = useCallback((temporal: Moment | null): string | null => {
        if (!temporal)
            return null

        const dt = DateTime.fromISO(temporal.toISOString())
        if (temporalType === AttrType.date)
            return dt.toISODate()

        if (temporalType === AttrType.time)
            return dt.toISOTime()

        return dt.setZone(appConfig.dateTime.timeZone, {keepLocalTime: true}).toISO()
    }, [temporalType])

    const handleStartTemporalChange = useCallback(
        (startTemporal: Moment | null) => onStartTemporalChange(parseTemporal(startTemporal)),
        [onStartTemporalChange, parseTemporal]
    )

    const handleEndTemporalChange = useCallback(
        (endTemporal: Moment | null) => onEndTemporalChange(parseTemporal(endTemporal)),
        [onEndTemporalChange, parseTemporal]
    )

    return (
        <>
            {temporalType === AttrType.time ? (
                <Space>
                    <span>
                        {t('Begin')}:&nbsp;
                        <TimePicker size="small" onChange={(time) => handleStartTemporalChange(time)}/>
                    </span>
                    <span>
                        {t('End')}:&nbsp;
                        <TimePicker size="small" onChange={(time) => handleEndTemporalChange(time)}/>
                    </span>
                </Space>
            ) : (
                <Space>
                    <span>
                        {t('Begin')}:&nbsp;
                        <DatePicker
                            size="small"
                            showTime={temporalType === AttrType.datetime || temporalType === AttrType.timestamp}
                            onChange={(date) => handleStartTemporalChange(date)}
                        />
                    </span>
                    <span>
                        {t('End')}:&nbsp;
                        <DatePicker
                            size="small"
                            showTime={temporalType === AttrType.datetime || temporalType === AttrType.timestamp}
                            onChange={(date) => handleEndTemporalChange(date)}
                        />
                    </span>
                </Space>
            )}
        </>
    )
}