import {FormInstance} from 'antd'
import {Column, QueryOp} from 'src/types/bi'

export interface FilterValueFieldProps {
  form: FormInstance
  namePrefix: (string | number)[]
  column: Column
  op: QueryOp
}
