import {DashMap, DashProps} from '.'
import {DashType, ItemData} from '../types'
import BarDash from './BarDash'
import {useCallback, useEffect, useMemo, useState} from 'react'
import QueryService from '../services/query'
import ItemService from '../services/item'
import appConfig from '../config'

const dashMap: DashMap = {
    [DashType.bar]: BarDash
}

export default function DashWrapper(props: DashProps) {
    const {dash} = props
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])
    const getDashComponent = useCallback(() => dashMap[dash.type], [dash.type])
    const [results, setResults] = useState<ItemData[][]>([])

    useEffect(() => {
        Promise.all(dash.items.map(dashItem => {
            const item = itemService.getByName(dashItem.name as string)
            return queryService.findAll(item, {
                sorting: [{id: dashItem.label as string, desc: false}],
                filters: [],
                pagination: {page: 1, pageSize: appConfig.query.defaultPageSize}
            })
        }))
            .then(fetchedResults => setResults(fetchedResults.map(res => res.data)))
    }, [dash.items, itemService, queryService])

    const DashComponent = getDashComponent()
    if (!DashComponent)
        throw new Error('Illegal attribute')

    return (
        <div>
            <DashComponent {...props} results={results}/>
        </div>
    )
}