import type {FC} from "react"
import type {FormInstance} from "antd"
import type {Attribute, ItemTab} from "src/types/schema"

export interface AttributeFieldProps {
  itemTab: ItemTab
  form: FormInstance
  attrName: string
  attribute: Attribute
  value: any
  setLoading: (loading: boolean) => void
  onChange: (value: any) => void
}

export interface AttributeFields {
  [type: string]: FC<AttributeFieldProps>
}
