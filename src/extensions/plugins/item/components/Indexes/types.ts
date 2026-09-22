import type {Index} from "src/types/schema"

export interface NamedIndex extends Index {
  name: string
}
