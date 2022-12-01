import {FC} from 'react'
import {IDash, ItemData} from '../../types'

export interface DashProps {
    pageKey: string
    dash: IDash
    data: ItemData[][]
    hasFullScreen: boolean
    onFullScreenChange: (fullScreen: boolean) => void
}

export interface DashMap {
    [type: string]: FC<DashProps>
}