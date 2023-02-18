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
    render: FC<InnerDashRenderProps>
}

export interface DashOpt {
    name: string
    label: string
    type: DashOptType
    required?: boolean
    fromDataset?: boolean
    enumSet?: any[]
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
    xFieldAlias?: string
    yFieldAlias?: string
    seriesField?: string
    hideLegend?: boolean
    legendPosition?: LegendPosition
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