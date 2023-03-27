import {FC} from 'react'
import {Attribute, Item, ItemData, UserInfo} from '../../../types'
import {FormInstance} from 'antd'
import {Callback} from '../../../services/mediator'

export interface AttributeFieldProps {
    me: UserInfo
    pageKey: string
    form: FormInstance
    item: Item
    data?: ItemData | null
    attrName: string
    attribute: Attribute
    value: any
    setLoading: (loading: boolean) => void
    onChange: (value: any) => void
    onItemCreate: (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => void
    onItemView: (item: Item, id: string, cb?: Callback, observerKey?: string) => void
    onItemDelete: (itemName: string, id: string) => void
}

export interface AttributeFields {
    [type: string]: FC<AttributeFieldProps>
}