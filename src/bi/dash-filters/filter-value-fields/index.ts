import {FormInstance} from 'antd'
import {FieldType, QueryOp} from '../../../types'

export interface FilterValueFieldProps {
    form: FormInstance
    namePrefix: (string|number)[]
    type: FieldType
    op: QueryOp
}