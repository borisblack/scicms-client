import {FC} from 'react'
import {FormInstance} from 'antd'
import {Attribute, Item, ItemData} from 'src/types'
import {Callback} from 'src/services/mediator'

export interface AttributeFieldProps {
    uniqueKey: string
    form: FormInstance
    item: Item
    data?: ItemData | null
    attrName: string
    attribute: Attribute
    value: any
    canAdmin: boolean
    setLoading: (loading: boolean) => void
    onChange: (value: any) => void
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => void
    onItemView: (item: Item, id: string, extra?: Record<string, any>, cb?: Callback, observerKey?: string) => void
    onItemDelete: (itemName: string, id: string) => void
}

export interface AttributeFields {
    [type: string]: FC<AttributeFieldProps>
}