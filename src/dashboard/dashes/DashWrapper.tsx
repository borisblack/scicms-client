import {useCallback, useEffect, useMemo, useState} from 'react'
import 'chartjs-adapter-luxon'
import {DashType, ItemData} from '../../types'
import {DashMap, DashProps} from '.'
import QueryService from '../../services/query'
import ItemService from '../../services/item'
import appConfig from '../../config'
import BarDash from './BarDash'
import DoughnutDash from './DoughnutDash'
import PieDash from './PieDash'
import LineDash from './LineDash'
import BubbleDash from './BubbleDash'
import PolarAreaDash from './PolarAreaDash'
import RadarDash from './RadarDash'
import ScatterDash from './ScatterDash'
import BubbleMapDash from './BubbleMapDash'

const dashMap: DashMap = {
    [DashType.bar]: BarDash,
    [DashType.bubble]: BubbleDash,
    [DashType.bubbleMap]: BubbleMapDash,
    [DashType.doughnut]: DoughnutDash,
    [DashType.line]: LineDash,
    [DashType.pie]: PieDash,
    [DashType.polarArea]: PolarAreaDash,
    [DashType.radar]: RadarDash,
    [DashType.scatter]: ScatterDash
}

export default function DashWrapper(props: DashProps) {
    const {dash} = props
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])
    const getDashComponent = useCallback(() => dashMap[dash.type], [dash.type])
    const [results, setResults] = useState<ItemData[][]>([])

    useEffect(() => {
        Promise.all(dash.datasets.map(dataset => {
            const item = itemService.getByName(dataset.itemName as string)
            return queryService.findAll(item, {
                sorting: [{id: dataset.label as string, desc: false}],
                filters: [],
                pagination: {page: 1, pageSize: appConfig.query.defaultPageSize}
            })
        }))
            .then(fetchedResults => setResults(fetchedResults.map(res => res.data)))
    }, [dash.datasets, itemService, queryService])

    const DashComponent = getDashComponent()
    if (!DashComponent)
        throw new Error('Illegal attribute')

    return (
        <div>
            <DashComponent {...props} data={results}/>
        </div>
    )
}