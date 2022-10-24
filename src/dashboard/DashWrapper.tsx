import {DashMap, DashProps} from '.'
import {DashType} from '../types'
import BarDash from './BarDash'
import {useCallback, useEffect} from 'react'

const dashMap: DashMap = {
    [DashType.bar]: BarDash
}

export default function DashWrapper(props: DashProps) {
    const {dash} = props
    const getDashComponent = useCallback(() => dashMap[dash.type], [dash.type])

    useEffect(() => {
        // TODO: Fetch data
    }, [])

    const DashComponent = getDashComponent()
    if (!DashComponent)
        throw new Error('Illegal attribute')

    return (
        <div>
            <DashComponent {...props}/>
        </div>
    )
}