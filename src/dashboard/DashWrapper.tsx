import {DashMap, DashProps} from '.'
import {DashType} from '../types'
import BarDash from './BarDash'
import {useCallback} from 'react'

const dashMap: DashMap = {
    [DashType.bar]: BarDash
}

export default function DashWrapper(props: DashProps) {
    const {dash} = props
    const getDashComponent = useCallback(() => dashMap[dash.type], [dash.type])

    const DashComponent = getDashComponent()
    if (!DashComponent)
        throw new Error('Illegal attribute')

    return <DashComponent {...props}/>
}