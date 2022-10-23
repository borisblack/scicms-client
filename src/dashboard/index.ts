import {FC} from 'react'
import {IDash} from '../types'

export interface DashProps {
    pageKey: string
    dash: IDash
}

export interface DashMap {
    [type: string]: FC<DashProps>
}