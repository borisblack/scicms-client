import {Dashboard, DashboardExtra, Dataset, IDash} from '../types/bi'
import {FormInstance} from 'antd'

export interface DashWrapperProps {
    pageKey: string
    datasetMap: Record<string, Dataset>
    dashboards: Dashboard[]
    dataset?: Dataset
    dashboard: Dashboard
    dash: IDash
    extra?: DashboardExtra
    readOnly: boolean
    canEdit: boolean
    onFullScreenChange: (fullScreen: boolean) => void
    onDashChange: (dash: IDash) => void
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
