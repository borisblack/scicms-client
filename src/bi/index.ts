import {Dashboard, Dataset, IDash} from '../types'
import {FormInstance} from 'antd'

export interface DashWrapperProps {
    pageKey: string
    dataset?: Dataset
    dashboard: Dashboard
    dash: IDash
    onFullScreenChange?: (fullScreen: boolean) => void
}

export interface DashProps extends DashWrapperProps {
    dataset: Dataset
}

export interface DashOptionsFormProps {
    dataset: Dataset
    availableColNames: string[]
    fieldName: string,
    form: FormInstance
    values: {[key: string]: any}
}
