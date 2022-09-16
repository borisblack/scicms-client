import {FC} from 'react'
import {FormInstance} from 'antd'

import {Attribute, Item, ItemData} from '../../../types'
import {Callback} from '../../../services/mediator'

export interface AttributeFieldProps {
    pageKey: string
    form: FormInstance
    item: Item
    data: ItemData | null | undefined
    attrName: string
    attribute: Attribute
    value: any
    setLoading: (loading: boolean) => void
    onChange: (value: any) => void
    onItemView: (item: Item, id: string, cb?: Callback, observerKey?: string) => void
}

export interface AttributeFields {
    [type: string]: FC<AttributeFieldProps>
}