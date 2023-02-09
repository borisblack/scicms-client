import {AttrType, DashType, IDash, MetricType, TemporalPeriod} from '../types'
import {DateTime} from 'luxon'
import util from 'util'
import i18n from '../i18n'
import appConfig from '../config'

export const dashTypes = Object.keys(DashType).sort()
export const numericTypes = [AttrType.int, AttrType.long, AttrType.float, AttrType.double, AttrType.decimal]
export const temporalTypes = [AttrType.date, AttrType.time, AttrType.datetime, AttrType.timestamp]
export const metricTypes = [...numericTypes, ...temporalTypes]
export const labelTypes = [
    AttrType.uuid, AttrType.string, AttrType.text, AttrType.sequence, AttrType.email, AttrType.enum,
    ...numericTypes,
    ...temporalTypes,
    AttrType.bool, AttrType.media, AttrType.relation
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
    [TemporalPeriod.LAST_3_HOURS]: util.format(i18n.t('Last %d hours'), 3),
    [TemporalPeriod.LAST_6_HOURS]: util.format(i18n.t('Last %d hours'), 6),
    [TemporalPeriod.LAST_12_HOURS]: util.format(i18n.t('Last %d hours'), 12),
    [TemporalPeriod.LAST_DAY]: i18n.t('Last day'),
    [TemporalPeriod.LAST_3_DAYS]: util.format(i18n.t('Last %d days'), 3),
    [TemporalPeriod.LAST_WEEK]: i18n.t('Last week'),
    [TemporalPeriod.LAST_2_WEEKS]: util.format(i18n.t('Last %d weeks'), 2),
    [TemporalPeriod.LAST_MONTH]: i18n.t('Last month'),
    [TemporalPeriod.LAST_3_MONTHS]: util.format(i18n.t('Last %d months'), 3),
    [TemporalPeriod.LAST_6_MONTHS]: util.format(i18n.t('Last %d months'), 6),
    [TemporalPeriod.LAST_YEAR]: i18n.t('Last year')
}

export const mapLabels = (data: any[], labelField: string): string[] =>
    data.map(it => it[labelField]?.toString()?.trim())

export const map3dMapMetrics = (dash: IDash, data: any[]): {longitude: number, latitude: number, value: any}[] => {
    const {metricType, metricField, latitudeField, longitudeField} = dash
    if (latitudeField == null || longitudeField == null)
        return []

    if (metricField == null)
        throw new Error("Illegal argument")

    return data.map(it => {
        const latitude = it[latitudeField]
        const longitude = it[longitudeField]
        return {
            longitude,
            latitude,
            value: parseMetric(it[metricField], metricType)
        }
    })
}

function parseMetric(metric: any, metricType?: MetricType): any {
    if (metricType != null && temporalTypeSet.has(metricType))
        return DateTime.fromISO(metric).toJSDate()

    return metric
}
