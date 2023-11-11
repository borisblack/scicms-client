import {FC} from 'react'
import {Attribute, Item, ItemData, Locale, UserInfo} from '../../../types'
import {FormInstance} from 'antd'
import {Callback} from '../../../services/mediator'
import {CoreConfig} from '../../../services/core-config'
import {ItemMap} from '../../../services/item'

export interface AttributeFieldProps {
    me: UserInfo
    uniqueKey: string
    coreConfig: CoreConfig
    items: ItemMap
    locales: Locale[]
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