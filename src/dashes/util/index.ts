import {registerLocale} from '@antv/g2plot'
import {DashOption, DashOptionType} from '../../bi'
import {RU_RU_LOCALE} from './locales/ru_RU'

export interface XYDashOptions {
    xField?: string
    yField?: string
    seriesField?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
}

export interface DoughnutDashOptions {
    angleField?: string
    colorField?: string
    radius?: number
    innerRadius?: number
    legendPosition?: LegendPosition
    hideLegend?: boolean
}

export interface BubbleDashOptions {
    xField?: string
    yField?: string
    sizeField?: string
    colorField?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
    xAxisLabelAutoRotate?: boolean
}

export interface BubbleMapDashOptions {
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

export const xyDashOptions: DashOption[] = [
    {name: 'xField', type: DashOptionType.string, label: 'x-axis field', required: true, fromDataset: true},
    {name: 'yField', type: DashOptionType.string, label: 'y-axis field', required: true, fromDataset: true},
    {name: 'seriesField', type: DashOptionType.string, label: 'Series field', fromDataset: true},
    {name: 'legendPosition', type: DashOptionType.string, label: 'Legend position', enumSet: [...legendPositions], defaultValue: 'top-left'},
    {name: 'hideLegend', type: DashOptionType.boolean, label: 'Hide legend'}
]

export const doughnutDashOptions: DashOption[] = [
    {name: 'angleField', type: DashOptionType.string, label: 'Angle field', required: true, fromDataset: true},
    {name: 'colorField', type: DashOptionType.string, label: 'Color field', required: true, fromDataset: true},
    {name: 'radius', type: DashOptionType.number, label: 'Radius', min: 0, max: 1, defaultValue: 1},
    {name: 'innerRadius', type: DashOptionType.number, label: 'Inner radius', min: 0, max: 1, defaultValue: 0},
    {name: 'legendPosition', type: DashOptionType.string, label: 'Legend position', enumSet: [...legendPositions], defaultValue: 'right'},
    {name: 'hideLegend', type: DashOptionType.boolean, label: 'Hide legend'}
]

export const bubbleDashOptions: DashOption[] = [
    {name: 'xField', type: DashOptionType.string, label: 'x-axis field', required: true, fromDataset: true},
    {name: 'yField', type: DashOptionType.string, label: 'y-axis field', required: true, fromDataset: true},
    {name: 'sizeField', type: DashOptionType.string, label: 'Size field', required: true, fromDataset: true},
    {name: 'colorField', type: DashOptionType.string, label: 'Color field', fromDataset: true},
    {name: 'legendPosition', type: DashOptionType.string, label: 'Legend position', enumSet: [...legendPositions], defaultValue: 'top-left'},
    {name: 'hideLegend', type: DashOptionType.boolean, label: 'Hide legend'},
    {name: 'xAxisLabelAutoRotate', type: DashOptionType.boolean, label: 'Auto rotate x-axis label'}
]

export const bubbleMapDashOptions: DashOption[] = [
    {name: 'latitudeField', type: DashOptionType.string, label: 'Latitude field', required: true, fromDataset: true},
    {name: 'longitudeField', type: DashOptionType.string, label: 'Longitude field', required: true, fromDataset: true},
    {name: 'locationField', type: DashOptionType.string, label: 'Location field', fromDataset: true},
    {name: 'sizeField', type: DashOptionType.string, label: 'Size field', required: true, fromDataset: true},
    {name: 'colorField', type: DashOptionType.string, label: 'Color field', fromDataset: true},
    {name: 'legendPosition', type: DashOptionType.string, label: 'Legend position', enumSet: [...legendPositions], defaultValue: 'top-left'},
    {name: 'hideLegend', type: DashOptionType.boolean, label: 'Hide legend'}
]

// Register additional locales
registerLocale('ru-RU', RU_RU_LOCALE)