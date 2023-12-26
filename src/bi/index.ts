import {Dashboard, DashboardExtra, Dataset, IDash, QueryFilter} from '../types'
import {FormInstance} from 'antd'

export interface DashWrapperProps {
    pageKey: string
    datasetMap: Record<string, Dataset>
    dashboards: Dashboard[]
    dataset?: Dataset
    dashboard: Dashboard
    extra?: DashboardExtra
    dash: IDash
    readOnly: boolean
    canEdit: boolean
    onFullScreenChange: (fullScreen: boolean) => void
    onChange: (updatedDash: IDash) => void
    onDelete: () => void
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
