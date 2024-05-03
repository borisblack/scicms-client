import {FieldType} from 'src/types'

export interface PropertyValueProps {
  type: FieldType
  value: string | null | undefined
  canEdit: boolean
  onChange: (value: string | null | undefined) => void
}