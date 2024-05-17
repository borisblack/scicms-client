import {FC} from 'react'
import {FormInstance} from 'antd'
import {Attribute, ItemDataWrapper} from 'src/types/schema'

export interface AttributeFieldProps {
    data: ItemDataWrapper
    form: FormInstance
    attrName: string
    attribute: Attribute
    value: any
    setLoading: (loading: boolean) => void
    onChange: (value: any) => void
}

export interface AttributeFields {
    [type: string]: FC<AttributeFieldProps>
}