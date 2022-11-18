import {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import 'chartjs-adapter-luxon'
import {DashType, ItemData, Location} from '../types'
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
import FullScreen from '../components/fullscreen/FullScreen'
import LabelToolbar from './LabelToolbar'
import LocationToolbar from './LocationToolbar'
import {ID_ATTR_NAME} from '../config/constants'
import {getAttributePaths} from '../util/dashboard'

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
    const getDashComponent = useCallback(() => dashMap[dash.type], [dash.type])
    const DashComponent = getDashComponent()
    if (!DashComponent)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const itemService = useMemo(() => ItemService.getInstance(), [])
    const queryService = useMemo(() => QueryService.getInstance(), [])
    const [results, setResults] = useState<ItemData[][]>([])
    const initialFilteredLabelSets = useMemo((): Set<string>[] => new Array(dash.datasets.length).fill(new Set<string>()), [dash.datasets])
    const [filteredLabelSets, setFilteredLabelSets] = useState<Set<string>[]>(initialFilteredLabelSets)
    const initialFilteredLocationLabelSets = useMemo((): Set<string>[] => new Array(dash.datasets.length).fill(new Set<string>()), [dash.datasets])
    const [filteredLocationLabelSets, setFilteredLocationLabelSets] = useState<Set<string>[]>(initialFilteredLocationLabelSets)
    const filteredResults = useMemo((): ItemData[][] => results.map((datasetResult, i) => datasetResult.filter(itemData => {
        const dataset = dash.datasets[i]
        const {location} = dataset
        const hasLabel = filteredLabelSets[i].has(itemData[dataset.label as string])
        return location ? (hasLabel && filteredLocationLabelSets[i].has(itemData[location]?.data?.label)) : hasLabel
    })), [dash.datasets, filteredLabelSets, filteredLocationLabelSets, results])

    const [fullScreen, setFullScreen] = useState<boolean>(false)
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

            const label = dataset.label as string
            const requestParams: ExtRequestParams = {
                sorting: [{id: label.includes('.') ? ID_ATTR_NAME : label, desc: false}],
                filters: [],
                pagination: {page: 1, pageSize: hasExtraFiltersInput ? appConfig.dashboard.maxPageSize : appConfig.dashboard.defaultPageSize}
            }

            const attributePaths = getAttributePaths(dataset)
            return queryService.findAll(item, requestParams, extraFiltersInput, attributePaths)
        }))
            .then(fetchedResults => {
                const newResults = fetchedResults.map(res => res.data)
                setResults(newResults)

                // Update checked labels and locations
                const checkedLabelSets: Set<string>[] = new Array(dash.datasets.length).fill(new Set<string>())
                const checkedLocationLabelSets: Set<string>[] = new Array(dash.datasets.length).fill(new Set<string>())
                for (let i = 0; i < newResults.length; i++) {
                    const dataset = dash.datasets[i]
                    const {label, location} = dataset
                    const datasetResult = newResults[i]

                    const labels = datasetResult.map(itemData => itemData[label as string])
                    checkedLabelSets[i] = new Set(labels)

                    const locationLabels = location ? datasetResult.filter(itemData => itemData[location]).map(itemData => (itemData[location].data as Location).label) : []
                    checkedLocationLabelSets[i] = new Set(locationLabels)
                }
                setFilteredLabelSets(checkedLabelSets)
                setFilteredLocationLabelSets(checkedLocationLabelSets)
            })
    }, [beginTemporal, dash.datasets, endTemporal, itemService, queryService])

    useEffect(() => {
        fetchResults()
        const interval = setInterval(fetchResults, dash.refreshIntervalSeconds * 1000)

        return () => clearInterval(interval)
    }, [dash.refreshIntervalSeconds, fetchResults])

    return (
        <FullScreen active={fullScreen}>
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
                        <div style={{padding: 8}}>
                            <LabelToolbar dash={dash} results={results} onChange={setFilteredLabelSets}/>
                        </div>
                    </LeftPanel>
                    <RightPanel title={t('Locations')} width={250}>
                        <div style={{padding: 8}}>
                            <LocationToolbar dash={dash} results={results} onChange={setFilteredLocationLabelSets}/>
                        </div>
                    </RightPanel>
                </>
            ) : (
                <Tooltip title={t('Full screen')} placement="leftBottom">
                    <Button type="link" icon={<FullscreenOutlined style={{fontSize: 24}}/>} className={styles.topRight} onClick={() => setFullScreen(true)}/>
                </Tooltip>
            )}
            <DashComponent {...props} data={filteredResults}/>
        </FullScreen>
    )
}