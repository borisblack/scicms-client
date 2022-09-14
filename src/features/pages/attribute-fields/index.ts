import {FC} from 'react'
import {FormInstance} from 'antd'

import {Attribute, Item} from '../../../types'

export interface AttributeFieldProps {
    pageKey: string
    form: FormInstance
    item: Item
    attrName: string
    attribute: Attribute
    value: any
    setLoading: (loading: boolean) => void
    onChange: (value: any) => void
    onItemView: (item: Item, id: string, cb?: () => void, observerKey?: string) => void
}

export interface AttributeFields {
    [type: string]: FC<AttributeFieldProps>
}