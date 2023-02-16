import {DashType, FieldType, IDash, TemporalPeriod, TemporalType} from '../types'
import {DateTime} from 'luxon'
import util from 'util'
import i18n from '../i18n'
import appConfig from '../config'
import dayjs, {Dayjs} from 'dayjs'

export const dashTypes = Object.keys(DashType).sort()
export const numericTypes = [FieldType.int, FieldType.long, FieldType.float, FieldType.double, FieldType.decimal]
export const temporalTypes = [FieldType.date, FieldType.time, FieldType.datetime, FieldType.timestamp]
export const metricTypes = [...numericTypes, ...temporalTypes]
export const labelTypes = [
    FieldType.uuid, FieldType.string, FieldType.text, FieldType.sequence, FieldType.email, FieldType.enum,
    ...numericTypes,
    ...temporalTypes,
    FieldType.bool, FieldType.media, FieldType.relation
]
export const temporalTypeSet = new Set(temporalTypes)
export const labelTypeSet = new Set([...labelTypes])
export const allTemporalPeriods: string[] = Object.keys(TemporalPeriod)
export const timeTemporalPeriods: TemporalPeriod[] = [
    TemporalPeriod.ARBITRARY,
    TemporalPeriod.LAST_5_MINUTES, TemporalPeriod.LAST_15_MINUTES, TemporalPeriod.LAST_30_MINUTES,
    TemporalPeriod.LAST_HOUR, TemporalPeriod.LAST_3_HOURS, TemporalPeriod.LAST_6_HOURS, TemporalPeriod.LAST_12_HOURS
]
export const timeScaleProps = {
    type: 'time',
    adapters: {
        date: {
            locale: appConfig.i18nLng,
            // zone: UTC
        }
    }
}

export const temporalPeriodTitles: {[key: string]: string} = {
    [TemporalPeriod.ARBITRARY]: i18n.t('Arbitrary'),
    [TemporalPeriod.LAST_5_MINUTES]: util.format(i18n.t('Last %d minutes'), 5),
    [TemporalPeriod.LAST_15_MINUTES]: util.format(i18n.t('Last %d minutes'), 15),
    [TemporalPeriod.LAST_30_MINUTES]: util.format(i18n.t('Last %d minutes'), 30),
    [TemporalPeriod.LAST_HOUR]: i18n.t('Last hour'),
    [TemporalPeriod.LAST_3_HOURS]: i18n.t('Last 3 hours'),
    [TemporalPeriod.LAST_6_HOURS]: util.format(i18n.t('Last %d hours'), 6),
    [TemporalPeriod.LAST_12_HOURS]: util.format(i18n.t('Last %d hours'), 12),
    [TemporalPeriod.LAST_DAY]: i18n.t('Last day'),
    [TemporalPeriod.LAST_3_DAYS]: i18n.t('Last 3 days'),
    [TemporalPeriod.LAST_WEEK]: i18n.t('Last week'),
    [TemporalPeriod.LAST_2_WEEKS]: i18n.t('Last 2 weeks'),
    [TemporalPeriod.LAST_MONTH]: i18n.t('Last month'),
    [TemporalPeriod.LAST_3_MONTHS]: i18n.t('Last 3 months'),
    [TemporalPeriod.LAST_6_MONTHS]: util.format(i18n.t('Last %d months'), 6),
    [TemporalPeriod.LAST_YEAR]: i18n.t('Last year'),
    [TemporalPeriod.LAST_3_YEARS]: i18n.t('Last 3 years'),
    [TemporalPeriod.LAST_5_YEARS]: util.format(i18n.t('Last %d years'), 5),
    [TemporalPeriod.LAST_10_YEARS]: util.format(i18n.t('Last %d years'), 10),
    [TemporalPeriod.LAST_20_YEARS]: util.format(i18n.t('Last %d years'), 20),
    [TemporalPeriod.LAST_30_YEARS]: util.format(i18n.t('Last %d years'), 30)
}

export const isTemporal = (fieldType: FieldType) => temporalTypeSet.has(fieldType)

export function startTemporalFromPeriod(period: TemporalPeriod, temporalType: TemporalType): Dayjs {
    switch (period) {
        case TemporalPeriod.LAST_5_MINUTES:
            return dayjs().subtract(5, 'minute')
        case TemporalPeriod.LAST_15_MINUTES:
            return dayjs().subtract(15, 'minute')
        case TemporalPeriod.LAST_30_MINUTES:
            return dayjs().subtract(30, 'minute')
        case TemporalPeriod.LAST_HOUR:
            return dayjs().subtract(1, 'hour')
        case TemporalPeriod.LAST_3_HOURS:
            return dayjs().subtract(3, 'hour')
        case TemporalPeriod.LAST_6_HOURS:
            return dayjs().subtract(6, 'hour')
        case TemporalPeriod.LAST_12_HOURS:
            return dayjs().subtract(12, 'hour')
        default:
            break
    }

    if (temporalType !== FieldType.time) {
        switch (period) {
            case TemporalPeriod.LAST_DAY:
                return dayjs().subtract(1, 'day')
            case TemporalPeriod.LAST_3_DAYS:
                return dayjs().subtract(3, 'day')
            case TemporalPeriod.LAST_WEEK:
                return dayjs().subtract(1, 'week')
            case TemporalPeriod.LAST_2_WEEKS:
                return dayjs().subtract(2, 'week')
            case TemporalPeriod.LAST_MONTH:
                return dayjs().subtract(1, 'month')
            case TemporalPeriod.LAST_3_MONTHS:
                return dayjs().subtract(3, 'month')
            case TemporalPeriod.LAST_6_MONTHS:
                return dayjs().subtract(6, 'month')
            case TemporalPeriod.LAST_YEAR:
                return dayjs().subtract(1, 'year')
            case TemporalPeriod.LAST_3_YEARS:
                return dayjs().subtract(3, 'year')
            case TemporalPeriod.LAST_5_YEARS:
                return dayjs().subtract(5, 'year')
            case TemporalPeriod.LAST_10_YEARS:
                return dayjs().subtract(10, 'year')
            case TemporalPeriod.LAST_20_YEARS:
                return dayjs().subtract(20, 'year')
            case TemporalPeriod.LAST_30_YEARS:
                return dayjs().subtract(30, 'year')
            default:
                break
        }
    }

    throw new Error('Illegal argument')
}

export const formatTemporalIso = (temporal: Dayjs | null, temporalType: TemporalType): string | null => {
    if (!temporal)
        return null

    const dt = DateTime.fromISO(temporal.toISOString())
    if (temporalType === FieldType.date)
        return dt.toISODate()

    if (temporalType === FieldType.time)
        return dt.toISOTime()

    return dt.setZone(appConfig.dateTime.timeZone, {keepLocalTime: true}).toISO()
}

export const formatTemporalDisplay = (temporal: string | null, temporalType: TemporalType): string => {
    if (temporal == null)
        return ''

    const dt = DateTime.fromISO(temporal)
    if (temporalType === FieldType.date)
        return dt.toFormat(appConfig.dateTime.luxonDisplayDateFormatString)
    else if (temporalType === FieldType.time)
        return dt.toFormat(appConfig.dateTime.luxonDisplayTimeFormatString)
    else
        return dt.toFormat(appConfig.dateTime.luxonDisplayDateTimeFormatString)
}

export const mapLabels = (data: any[], labelField: string): string[] =>
    data.map(it => it[labelField]?.toString()?.trim())

export const map3dMapMetrics = (dash: IDash, data: any[]): {longitude: number, latitude: number, value: any}[] => {
    return []
}
