import {AttrType, DashType, Dataset, IDash, ItemData, Location, MetricType} from '../types'
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
    AttrType.bool, AttrType.media, AttrType.location, AttrType.relation
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

export const childTreeNodeKeyRegExp = /(.+?)-(\d+)-child/

export const mapLabels = (dash: IDash, data: ItemData[][]) =>
    data.map((row, i) => row.map(cell => cell[dash.datasets[i].label as string]?.trim())).flatMap(labels => labels)

export const mapMetrics = (dash: IDash, data: ItemData[][]): any[] =>
    data.map((row, i) => row.map(cell => parseMetric(cell[dash.datasets[i].metric as string], dash.metricType))).flatMap(metrics => metrics)

export const map2dMetrics = (dash: IDash, data: ItemData[][]): {x: DateTime, y: any}[] =>
    data.map((row, i) => row.map(cell => {
        const dataset = dash.datasets[i]
        return {x: DateTime.fromISO(cell[dataset.temporal as string]), y: parseMetric(cell[dataset.metric as string], dash.metricType)}
    })).flatMap(metricsWithTemporal => metricsWithTemporal)

export const map3dMetrics = (dash: IDash, data: ItemData[][]): {x: DateTime, y: any, r: number}[] =>
    data.map((row, i) => {
        const dataset = dash.datasets[i]
        return row.map(cell => ({x: DateTime.fromISO(cell[dataset.temporal as string]), y: parseMetric(cell[dataset.metric as string], dash.metricType), r: 2}))
    }).flatMap(metrics => metrics)

export const map3dMapMetrics = (dash: IDash, data: ItemData[][]): {longitude: number, latitude: number, value: any}[] =>
    data.map((row, i) => {
        const dataset = dash.datasets[i]
        if (!dataset.location)
            return []

        return row.map(cell => {
            const location = (cell[dataset.location as string]?.data ?? {}) as Location
            const {latitude, longitude} = location
            return {
                longitude,
                latitude,
                value: parseMetric(cell[dataset.metric as string], dash.metricType)
            }
        })
    }).flatMap(metrics => metrics)

function parseMetric(metric: any, metricType: MetricType): any {
    if (temporalTypeSet.has(metricType))
        return DateTime.fromISO(metric).toJSDate()

    return metric
}

export function getAttributePaths(dataset: Dataset): {[name: string]: string} {
    const attributesOverride = {} as {[name: string]: string}
    const {label, metric, location, temporal} = dataset
    if (label && label.includes('.'))
        attributesOverride[label.substring(0, label.indexOf('.'))] = label

    if (metric && metric.includes('.'))
        attributesOverride[metric.substring(0, metric.indexOf('.'))] = metric

    if (location && location.includes('.'))
        attributesOverride[location.substring(0, location.indexOf('.'))] = location

    if (temporal && temporal.includes('.'))
        attributesOverride[temporal.substring(0, temporal.indexOf('.'))] = temporal

    return attributesOverride
}
