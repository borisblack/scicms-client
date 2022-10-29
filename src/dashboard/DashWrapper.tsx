import {CSSProperties, useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import 'chartjs-adapter-luxon'
import {DashType, ItemData} from '../types'
import {DashMap, DashProps} from './dashes'
import QueryService, {ExtRequestParams, FilterInput, FiltersInput} from '../services/query'
import ItemService from '../services/item'
import appConfig from '../config'
import BarDash from './dashes/BarDash'
import DoughnutDash from './dashes/DoughnutDash'
import PieDash from './dashes/PieDash'
import LineDash from './dashes/LineDash'
import BubbleDash from './dashes/BubbleDash'
import PolarAreaDash from './dashes/PolarAreaDash'
import RadarDash from './dashes/RadarDash'
import ScatterDash from './dashes/ScatterDash'
import BubbleMapDash from './dashes/BubbleMapDash'
import styles from './DashWrapper.module.css'
import {Button, Tooltip} from 'antd'
import {FullscreenExitOutlined, FullscreenOutlined} from '@ant-design/icons'
import RightPanel from '../components/panel/RightPanel'
import LeftPanel from '../components/panel/LeftPanel'
import TopPanel from '../components/panel/TopPanel'
import TemporalToolbar from './TemporalToolbar'

const fullScreenWrapperStyle: CSSProperties = {position: 'fixed', left: 0, top: 0, width: '100%', height: '100%'}
const normalWrapperStyle: CSSProperties = {position: 'relative'}

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
    const {t} = useTranslation()
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])
    const getDashComponent = useCallback(() => dashMap[dash.type], [dash.type])
    const [results, setResults] = useState<ItemData[][]>([])
    const [fullScreen, setFullScreen] = useState<boolean>(false)
    const wrapperStyle: CSSProperties = useMemo(() => fullScreen ? fullScreenWrapperStyle : normalWrapperStyle, [fullScreen])
    const [beginTemporal, setBeginTemporal] = useState<string | null>(null)
    const [endTemporal, setEndTemporal] = useState<string | null>(null)

    const fetchResults = useCallback(() => {
        Promise.all(dash.datasets.map(dataset => {
            const item = itemService.getByName(dataset.itemName as string)
            const hasExtraFiltersInput = beginTemporal || endTemporal
            const extraFiltersInput: FiltersInput<ItemData> = {}
            if (hasExtraFiltersInput) {
                const temporalFilter: FilterInput<ItemData, string> = {}
                if (beginTemporal)
                    temporalFilter.gte = beginTemporal

                if (endTemporal)
                    temporalFilter.lte = endTemporal

                extraFiltersInput[dataset.temporal as string] = temporalFilter
            }

            const requestParams: ExtRequestParams = {
                sorting: [{id: dataset.label as string, desc: false}],
                filters: [],
                pagination: {page: 1, pageSize: hasExtraFiltersInput ? appConfig.dashboard.maxPageSize : appConfig.dashboard.defaultPageSize}
            }

            return queryService.findAll(item, requestParams, extraFiltersInput)
        }))
            .then(fetchedResults => setResults(fetchedResults.map(res => res.data)))
    }, [dash.datasets, beginTemporal, endTemporal, itemService, queryService])

    useEffect(() => {
        fetchResults()
        const interval = setInterval(fetchResults, dash.refreshIntervalSeconds * 1000)

        return () => clearInterval(interval)
    }, [dash.refreshIntervalSeconds, fetchResults])

    const DashComponent = getDashComponent()
    if (!DashComponent)
        throw new Error('Illegal attribute')

    return (
        <div className={styles.dashWrapper} style={wrapperStyle}>
            {fullScreen ? (
                <>
                    <Tooltip title={t('Exit full screen')} placement="leftBottom">
                        <Button type="link" icon={<FullscreenExitOutlined style={{fontSize: 24}}/>} className={styles.topRight} onClick={() => setFullScreen(false)}/>
                    </Tooltip>
                    {dash.temporalType && (
                        <TopPanel title={t('Temporal')} height={60}>
                            <div style={{padding: '16px 8px'}}>
                                <TemporalToolbar temporalType={dash.temporalType} onBeginTemporalChange={setBeginTemporal} onEndTemporalChange={setEndTemporal}/>
                            </div>
                        </TopPanel>
                    )}
                    <LeftPanel title={t('Labels')} width={250}>
                        Hi Left!
                    </LeftPanel>
                    <RightPanel title={t('Locations')} width={250}>
                        Hi Right!
                    </RightPanel>
                </>
            ) : (
                <Tooltip title={t('Full screen')} placement="leftBottom">
                    <Button type="link" icon={<FullscreenOutlined style={{fontSize: 24}}/>} className={styles.topRight} onClick={() => setFullScreen(true)}/>
                </Tooltip>
            )}
            <DashComponent {...props} data={results}/>
        </div>
    )
}