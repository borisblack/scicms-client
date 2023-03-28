import {DatePicker, Select, Space, TimePicker} from 'antd'
import {FieldType, TemporalPeriod, TemporalType} from '../types'
import {useTranslation} from 'react-i18next'
import dayjs, {Dayjs} from 'dayjs'
import {useCallback} from 'react'
import {allTemporalPeriods, formatTemporalIso, temporalPeriodTitles, timeTemporalPeriods} from '../util/dashboard'

interface Props {
    temporalType: TemporalType
    period: TemporalPeriod
    startTemporal: string | null
    endTemporal: string | null
    onPeriodChange: (period: TemporalPeriod) => void
    onStartTemporalChange: (startTemporal: string | null) => void
    onEndTemporalChange: (endTemporal: string | null) => void
}

const {Option: SelectOption} = Select

export default function TemporalToolbar({temporalType, period, startTemporal, endTemporal, onPeriodChange, onStartTemporalChange, onEndTemporalChange}: Props) {
    const {t} = useTranslation()

    const handleStartTemporalChange = useCallback(
        (startTemporal: Dayjs | null) => onStartTemporalChange(formatTemporalIso(startTemporal, temporalType)),
        [onStartTemporalChange, temporalType]
    )

    const handleEndTemporalChange = useCallback(
        (endTemporal: Dayjs | null) => onEndTemporalChange(formatTemporalIso(endTemporal, temporalType)),
        [onEndTemporalChange, temporalType]
    )

    return (
        <Space>
            <span>
                {t('Period')}:&nbsp;
                <Select size="small" value={period} style={{width: 200}} onSelect={onPeriodChange}>
                    {(temporalType === FieldType.time ? timeTemporalPeriods : allTemporalPeriods)
                        .map(k => <SelectOption key={k} value={k}>{temporalPeriodTitles[k]}</SelectOption>)
                    }
                </Select>
            </span>
            {period === TemporalPeriod.ARBITRARY && (
                <>
                    <span>
                        {t('Begin')}:&nbsp;
                        {temporalType === FieldType.time ? (
                            <TimePicker
                                size="small"
                                value={startTemporal == null ? null : dayjs(startTemporal)}
                                onChange={(time) => handleStartTemporalChange(time)}
                            />
                        ) : (
                            <DatePicker
                                size="small"
                                showTime={temporalType === FieldType.datetime || temporalType === FieldType.timestamp}
                                value={startTemporal == null ? null : dayjs(startTemporal)}
                                onChange={(date) => handleStartTemporalChange(date)}
                            />
                        )}
                    </span>
                    <span>
                        {t('End')}:&nbsp;
                        {temporalType === FieldType.time ? (
                            <TimePicker
                                size="small"
                                value={endTemporal == null ? null : dayjs(endTemporal)}
                                onChange={(time) => handleEndTemporalChange(time)}
                            />
                        ) : (
                            <DatePicker
                                size="small"
                                showTime={temporalType === FieldType.datetime || temporalType === FieldType.timestamp}
                                value={endTemporal == null ? null : dayjs(endTemporal)}
                                onChange={(date) => handleEndTemporalChange(date)}
                            />
                        )}
                    </span>
                </>
            )}
        </Space>
    )
}