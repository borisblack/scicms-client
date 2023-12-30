import {Dashboard, DashboardExtra, Dataset, IDash} from '../types/bi'
import {FormInstance} from 'antd'

export interface DashWrapperProps {
    pageKey: string
    dataset?: Dataset
    dashboard: Dashboard
    extra?: DashboardExtra
    dash: IDash
    readOnly: boolean
    canEdit: boolean
    onFullScreenChange: (fullScreen: boolean) => void
    onDashFormModalOpen: () => void
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
