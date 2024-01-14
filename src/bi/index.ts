import {Dataset} from '../types/bi'
import {FormInstance} from 'antd'
import {DashWrapperProps} from './DashWrapper'

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
