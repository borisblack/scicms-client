import {FC} from 'react'
import {FormInstance} from 'antd'

import {Attribute, Item} from '../../../types'

export interface AttributeFieldProps {
    form: FormInstance
    item: Item
    attrName: string
    attribute: Attribute
    value: any
    onView: (item: Item, id: string) => void
}

export interface AttributeFields {
    [type: string]: FC<AttributeFieldProps>
}