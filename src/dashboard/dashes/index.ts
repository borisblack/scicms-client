import {FC} from 'react'
import {DashType, Dataset, IDash} from '../../types'

export interface DashRenderProps {
    pageKey: string
    dataset: Dataset
    dash: IDash
    isFullScreenComponentExist: boolean
    onFullScreenComponentStateChange: (fullScreen: boolean) => void
}

export interface InnerDashRenderProps extends DashRenderProps {
    fullScreen: boolean
    data: any[]
}

export interface DashMap {
    [type: string]: FC<InnerDashRenderProps>
}

export interface DashRenderer {
    supports: (dashType: DashType) => boolean
    listOpts: () => DashOpt[]
    getMetricField: () => string
    render: FC<InnerDashRenderProps>
}

export interface DashOpt {
    name: string
    label: string
    type: DashOptType
    required?: boolean
    fromDataset?: boolean
    enumSet?: any[]
    min?: number // for number type
    max?: number // for number type
    defaultValue?: any
}

export enum DashOptType {
    string = 'string',
    number = 'number',
    boolean = 'boolean'
}

export interface XYDashOpts {
    xField?: string
    yField?: string
    seriesField?: string
    xFieldAlias?: string
    yFieldAlias?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
}

export interface DoughnutDashOpts {
    angleField?: string
    colorField?: string
    angleFieldAlias?: string
    colorFieldAlias?: string
    radius?: number
    innerRadius?: number
    legendPosition?: LegendPosition
    hideLegend?: boolean
}

export interface BubbleDashOpts {
    xField?: string
    yField?: string
    sizeField?: string
    colorField?: string
    xFieldAlias?: string
    yFieldAlias?: string
    sizeFieldAlias?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
    xAxisLabelAutoRotate?: boolean
}

export interface BubbleMapDashOpts {
    latitudeField?: string
    longitudeField?: string
    locationField?: string
    sizeField?: string
    colorField?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
}

export type LegendPosition = 'top' | 'top-left' | 'top-right' | 'right' | 'right-top' | 'right-bottom' | 'left' | 'left-top' | 'left-bottom' | 'bottom' | 'bottom-left' | 'bottom-right'

export const legendPositions: LegendPosition[] = [
    'top',
    'top-left',
    'top-right',
    'right',
    'right-top',
    'right-bottom',
    'left',
    'left-top',
    'left-bottom',
    'bottom',
    'bottom-left',
    'bottom-right'
]

export const xyDashOpts: DashOpt[] = [
    {name: 'xField', type: DashOptType.string, label: 'x-axis field', required: true, fromDataset: true},
    {name: 'yField', type: DashOptType.string, label: 'y-axis field', required: true, fromDataset: true},
    {name: 'xFieldAlias', type: DashOptType.string, label: 'x-axis field alias'},
    {name: 'yFieldAlias', type: DashOptType.string, label: 'y-axis field alias'},
    {name: 'seriesField', type: DashOptType.string, label: 'Series field', fromDataset: true},
    {name: 'legendPosition', type: DashOptType.string, label: 'Legend position', enumSet: [...legendPositions], defaultValue: 'top-left'},
    {name: 'hideLegend', type: DashOptType.boolean, label: 'Hide legend'}
]

export const doughnutDashOpts: DashOpt[] = [
    {name: 'angleField', type: DashOptType.string, label: 'Angle field', required: true, fromDataset: true},
    {name: 'colorField', type: DashOptType.string, label: 'Color field', required: true, fromDataset: true},
    {name: 'angleFieldAlias', type: DashOptType.string, label: 'Angle field alias'},
    {name: 'colorFieldAlias', type: DashOptType.string, label: 'Color field alias'},
    {name: 'radius', type: DashOptType.number, label: 'Radius', min: 0, max: 1, defaultValue: 1},
    {name: 'innerRadius', type: DashOptType.number, label: 'Inner radius', min: 0, max: 1, defaultValue: 0},
    {name: 'legendPosition', type: DashOptType.string, label: 'Legend position', enumSet: [...legendPositions], defaultValue: 'right'},
    {name: 'hideLegend', type: DashOptType.boolean, label: 'Hide legend'}
]

export const bubbleDashOpts: DashOpt[] = [
    {name: 'xField', type: DashOptType.string, label: 'x-axis field', required: true, fromDataset: true},
    {name: 'yField', type: DashOptType.string, label: 'y-axis field', required: true, fromDataset: true},
    {name: 'sizeField', type: DashOptType.string, label: 'Size field', required: true, fromDataset: true},
    {name: 'colorField', type: DashOptType.string, label: 'Color field', fromDataset: true},
    {name: 'xFieldAlias', type: DashOptType.string, label: 'x-axis field alias'},
    {name: 'yFieldAlias', type: DashOptType.string, label: 'y-axis field alias'},
    {name: 'sizeFieldAlias', type: DashOptType.string, label: 'Size field alias'},
    {name: 'legendPosition', type: DashOptType.string, label: 'Legend position', enumSet: [...legendPositions], defaultValue: 'top-left'},
    {name: 'hideLegend', type: DashOptType.boolean, label: 'Hide legend'},
    {name: 'xAxisLabelAutoRotate', type: DashOptType.boolean, label: 'Auto rotate x-axis label'}
]

export const bubbleMapDashOpts: DashOpt[] = [
    {name: 'latitudeField', type: DashOptType.string, label: 'Latitude field', required: true, fromDataset: true},
    {name: 'longitudeField', type: DashOptType.string, label: 'Longitude field', required: true, fromDataset: true},
    {name: 'locationField', type: DashOptType.string, label: 'Location field', fromDataset: true},
    {name: 'sizeField', type: DashOptType.string, label: 'Size field', required: true, fromDataset: true},
    {name: 'colorField', type: DashOptType.string, label: 'Color field', fromDataset: true},
    {name: 'legendPosition', type: DashOptType.string, label: 'Legend position', enumSet: [...legendPositions], defaultValue: 'top-left'},
    {name: 'hideLegend', type: DashOptType.boolean, label: 'Hide legend'}
]