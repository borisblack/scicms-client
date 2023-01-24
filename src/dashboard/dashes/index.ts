import {FC} from 'react'
import {IDash} from '../../types'

export interface DashProps {
    pageKey: string
    dash: IDash
    isFullScreenComponentExist: boolean
    onFullScreenComponentStateChange: (fullScreen: boolean) => void
}

export interface InnerDashProps extends DashProps {
    fullScreen: boolean
    data: any[]
}

export interface DashMap {
    [type: string]: FC<InnerDashProps>
}