import {Column} from 'src/types/bi'

export interface NamedColumn extends Column {
    name: string
}