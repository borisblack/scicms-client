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
    listProps: () => DashProp[]
    setProps: (props: any) => void
    render: FC<InnerDashRenderProps>
}

export interface DashProp {
    name: string
    label: string
    type: DashPropType
    required?: boolean
    fromDataset?: boolean
    opts?: any[]
}

export enum DashPropType {
    string = 'string',
    number = 'number',
    boolean = 'boolean'
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