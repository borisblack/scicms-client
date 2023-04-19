import {FormInstance} from 'antd'
import {Column, QueryOp} from '../../../types'

export interface FilterValueFieldProps {
    form: FormInstance
    namePrefix: (string|number)[]
    column: Column
    op: QueryOp
}