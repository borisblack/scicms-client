import {ReactElement, ReactNode} from 'react'

import {Attribute, Item, ItemData, UserInfo} from '../types'
import {FormInstance} from 'antd'
import {Callback} from '../services/mediator'
import customAttributeFieldConfig from '../config/custom-attribute-field'

export interface CustomAttributeField {
    id: string
    supports: (itemName: string, attrName: string) => boolean
    priority: number
    render: ({context}: CustomAttributeFieldRenderProps) => ReactNode
}

export interface CustomAttributeFieldRenderProps {
    context: CustomAttributeFieldRenderContext
}

export interface CustomAttributeFieldRenderContext {
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

const attributeFields: CustomAttributeField[] = customAttributeFieldConfig.attributeFields.sort((a, b) => a.priority - b.priority)

export const hasAttributeField = (itemName: string, attrName: string): boolean =>
    getAttributeField(itemName, attrName) != null

export const getAttributeField = (itemName: string, attrName: string): CustomAttributeField | undefined =>
    attributeFields.find(af => af.supports(itemName, attrName))

export function renderAttributeField(itemName: string, attrName: string, context: CustomAttributeFieldRenderContext): ReactElement | null {
    const attributeField = getAttributeField(itemName, attrName)
    if (!attributeField)
        return null

    return (
        <>
            {attributeField.render({context})}
        </>
    )
}