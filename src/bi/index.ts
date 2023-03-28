import {Dataset, IDash} from '../types'

export interface DashProps {
    pageKey: string
    dataset: Dataset
    dash: IDash
    isFullScreenComponentExist: boolean
    onFullScreenComponentStateChange: (fullScreen: boolean) => void
}

export interface DashOption {
    name: string
    label: string
    type: DashOptionType
    required?: boolean
    fromDataset?: boolean
    enumSet?: any[]
    min?: number // for number type
    max?: number // for number type
    defaultValue?: any
}

export enum DashOptionType {
    string = 'string',
    number = 'number',
    boolean = 'boolean'
}
