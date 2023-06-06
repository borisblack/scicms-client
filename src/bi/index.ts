import {Dashboard, DashboardExtra, Dataset, IDash, QueryFilter} from '../types'
import {FormInstance} from 'antd'

export interface DashWrapperProps {
    pageKey: string
    dataset?: Dataset
    dashboard: Dashboard
    extra?: DashboardExtra
    dash: IDash
    onFullScreenChange: (fullScreen: boolean) => void
    onRelatedDashboardOpen: (dashboardId: string, queryFilter: QueryFilter) => void
    onEdit: () => void
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
