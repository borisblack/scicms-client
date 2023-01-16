import {AttrType, DashType, Dataset, MetricType} from '../types'
import {DateTime} from 'luxon'
import appConfig from '../config'
import {UTC} from '../config/constants'

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
            zone: UTC
        }
    }
}

export const mapLabels = (dataset: Dataset, data: any[]): string[] =>
    data.map(it => it[dataset.labelField]?.trim())

export const mapMetrics = (dataset: Dataset, data: any[]): any[] =>
    data.map(it => parseMetric(it[dataset.metricField], dataset.metricType))

export const map2dMetrics = (dataset: Dataset, data: any[]): {x: DateTime, y: any}[] => {
   const {temporalField} = dataset
    if (temporalField == null)
        return []

    return data.map(it => ({
        x: DateTime.fromISO(it[temporalField]),
        y: parseMetric(it[dataset.metricField], dataset.metricType)
    }))
}

export const map3dMetrics = (dataset: Dataset, data: any[]): {x: DateTime, y: any, r: number}[] => {
    const {temporalField} = dataset
    if (temporalField == null)
        return []

    return data.map(it => ({
        x: DateTime.fromISO(it[temporalField]),
        y: parseMetric(it[temporalField], dataset.metricType),
        r: 2
    }))
}

export const map3dMapMetrics = (dataset: Dataset, data: any[]): {longitude: number, latitude: number, value: any}[] => {
    const {latitudeField, longitudeField} = dataset
    if (latitudeField == null || longitudeField == null)
        return []

    return data.map(it => {
        const latitude = it[latitudeField]
        const longitude = it[longitudeField]
        return {
            longitude,
            latitude,
            value: parseMetric(it[dataset.metricField], dataset.metricType)
        }
    })
}

function parseMetric(metric: any, metricType: MetricType): any {
    if (temporalTypeSet.has(metricType))
        return DateTime.fromISO(metric).toJSDate()

    return metric
}
