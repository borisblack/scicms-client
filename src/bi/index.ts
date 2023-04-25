import {Dashboard, Dataset, IDash} from '../types'
import {FormInstance} from 'antd'

export interface DashProps {
    pageKey: string
    dataset: Dataset
    dashboard: Dashboard
    dash: IDash
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

export interface DashOptionsFormProps {
    dataset: Dataset
    availableColNames: string[]
    fieldName: string,
    form: FormInstance
    values: {[key: string]: any}
}
