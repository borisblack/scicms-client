import {FC} from 'react'
import {IDash, ItemData} from '../types'

export interface DashProps {
    pageKey: string
    dash: IDash
    results: ItemData[][]
}

export interface DashMap {
    [type: string]: FC<DashProps>
}