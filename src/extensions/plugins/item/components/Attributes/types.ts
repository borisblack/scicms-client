import {Attribute} from 'src/types/schema'

export interface NamedAttribute extends Attribute {
    name: string
}