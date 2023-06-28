import {FC} from 'react'
import {Attribute, Item, ItemData, UserInfo} from '../../../types'
import {FormInstance} from 'antd'
import {Callback} from '../../../services/mediator'
import {CoreConfig} from '../../../services/core-config'

export interface AttributeFieldProps {
    me: UserInfo
    coreConfig: CoreConfig
    pageKey: string
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