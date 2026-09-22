import type {FormInstance} from "antd"
import type {Column, QueryOp} from "src/types/bi"

export interface FilterValueFieldProps {
  form: FormInstance
  namePrefix: (string | number)[]
  column: Column
  op: QueryOp
}
