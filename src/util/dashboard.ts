import {AttrType, DashType, IDash, MetricType} from '../types'
import {DateTime} from 'luxon'
import appConfig from '../config'

export const dashTypes = Object.keys(DashType).sort()
export const numericTypes = [AttrType.int, AttrType.long, AttrType.float, AttrType.double, AttrType.decimal]
export const temporalTypes = [AttrType.date, AttrType.time, AttrType.datetime, AttrType.timestamp]
export const metricTypes = [...numericTypes, ...temporalTypes, AttrType.bool]
export const labelTypes = [
    AttrType.uuid, AttrType.string, AttrType.text, AttrType.sequence, AttrType.email, AttrType.enum,
    ...numericTypes,
    ...temporalTypes,
    AttrType.bool, AttrType.media, AttrType.relation
]
export const temporalTypeSet = new Set(temporalTypes)
export const labelTypeSet = new Set([...labelTypes])

export const timeScaleProps = {
    type: 'time',
    adapters: {
        date: {
            locale: appConfig.i18nLng,
            // zone: UTC
        }
    }
}

export const mapLabels = (data: any[], labelField: string): string[] =>
    data.map(it => it[labelField]?.toString()?.trim())

export const mapMetrics = (dash: IDash, data: any[]): any[] => {
    const {metricType, metricField} = dash
    if (metricField == null)
        throw new Error("Illegal argument")

    return data.map(it => parseMetric(it[metricField], metricType))
}

export const map2dMetrics = (dash: IDash, data: any[]): {x: DateTime, y: any}[] => {
    const {metricType, metricField, temporalField} = dash
    if (temporalField == null)
        return []

    if (metricField == null)
        throw new Error("Illegal argument")

    return data.map(it => ({
        x: DateTime.fromISO(it[temporalField]),
        y: parseMetric(it[metricField], metricType)
    }))
}

export const map3dMetrics = (dash: IDash, data: any[]): {x: DateTime, y: any, r: number}[] => {
    const {metricType, temporalField} = dash
    if (temporalField == null)
        return []

    return data.map(it => ({
        x: DateTime.fromISO(it[temporalField]),
        y: parseMetric(it[temporalField], metricType),
        r: 2
    }))
}

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
