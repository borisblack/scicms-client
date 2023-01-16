import {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import 'chartjs-adapter-luxon'
import {DashType, Dataset} from '../types'
import {DashMap, DashProps} from './dashes'
import BarDash from './dashes/BarDash'
import DoughnutDash from './dashes/DoughnutDash'
import PieDash from './dashes/PieDash'
import LineDash from './dashes/LineDash'
import BubbleDash from './dashes/BubbleDash'
import PolarAreaDash from './dashes/PolarAreaDash'
import RadarDash from './dashes/RadarDash'
import ScatterDash from './dashes/ScatterDash'
import BubbleMapDash from './dashes/BubbleMapDash'
import {Button, PageHeader} from 'antd'
import {FullscreenExitOutlined, FullscreenOutlined} from '@ant-design/icons'
import RightPanel from '../components/panel/RightPanel'
import LeftPanel from '../components/panel/LeftPanel'
import TopPanel from '../components/panel/TopPanel'
import TemporalToolbar from './TemporalToolbar'
import FullScreen from '../components/fullscreen/FullScreen'
import LabelToolbar from './LabelToolbar'
import LocationToolbar from './LocationToolbar'
import StatisticDash from './dashes/StatisticDash'
import styles from './DashWrapper.module.css'
import DatasetService from '../services/dataset'
import {useCache} from '../util/hooks'

const dashMap: DashMap = {
    [DashType.bar]: BarDash,
    [DashType.bubble]: BubbleDash,
    [DashType.bubbleMap]: BubbleMapDash,
    [DashType.doughnut]: DoughnutDash,
    [DashType.line]: LineDash,
    [DashType.pie]: PieDash,
    [DashType.polarArea]: PolarAreaDash,
    [DashType.radar]: RadarDash,
    [DashType.radar]: RadarDash,
    [DashType.scatter]: ScatterDash,
    [DashType.statistic]: StatisticDash
}

export default function DashWrapper(props: DashProps) {
    const {dash, isFullScreenComponentExist, onFullScreenComponentStateChange} = props
    const getDashComponent = useCallback(() => dashMap[dash.type], [dash.type])
    const DashComponent = getDashComponent()
    if (!DashComponent)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const datasetService = useMemo(() => DatasetService.getInstance(), [])
    const {data: datasetItem} = useCache<Dataset>(() => datasetService.findByName(dash.dataset))
    const [datasetData, setDatasetData] = useState<any[]>([])
    const [filteredLabelSet, setFilteredLabelSet] = useState<Set<string>>(new Set())
    const [filteredLocationLabelSet, setFilteredLocationLabelSet] = useState<Set<string>>(new Set())
    const filteredData = useMemo((): any[] => {
        if (datasetItem == null)
            return []

        return datasetData.filter(it => {
            const {labelField, locationLabelField} = datasetItem
            const hasLabel = filteredLabelSet.has(it[labelField])
            return locationLabelField ? (hasLabel && filteredLocationLabelSet.has(it[locationLabelField])) : hasLabel
        })
    }, [datasetData, datasetItem, filteredLabelSet, filteredLocationLabelSet])

    const [fullScreen, setFullScreen] = useState<boolean>(false)
    const [beginTemporal, setBeginTemporal] = useState<string | null>(null)
    const [endTemporal, setEndTemporal] = useState<string | null>(null)

    const handleFullScreenChange = useCallback((fullScreen: boolean) => {
        setFullScreen(fullScreen)
        onFullScreenComponentStateChange(fullScreen)
    }, [onFullScreenComponentStateChange])

    const fetchDatasetData = useCallback(async () => {
        if (datasetItem == null)
            return

        const fetchedDatasetData = await datasetService.loadData(dash.dataset, beginTemporal, endTemporal)
        setDatasetData(fetchedDatasetData)

        // Update checked labels and locations
        const {labelField, locationLabelField} = datasetItem
        const labels = fetchedDatasetData.map(it => it[labelField])
        const checkedLabelSet = new Set(labels)
        const locationLabels = locationLabelField ? fetchedDatasetData.map(it => it[locationLabelField]) : []
        const checkedLocationLabelSet = new Set(locationLabels)
        setFilteredLabelSet(checkedLabelSet)
        setFilteredLocationLabelSet(checkedLocationLabelSet)
    }, [beginTemporal, dash.dataset, datasetItem, datasetService, endTemporal])

    useEffect(() => {
        fetchDatasetData()
        const interval = setInterval(fetchDatasetData, dash.refreshIntervalSeconds * 1000)

        return () => clearInterval(interval)
    }, [dash.refreshIntervalSeconds, fetchDatasetData])

    return datasetItem && (
        <FullScreen active={fullScreen} normalStyle={{display: isFullScreenComponentExist ? 'none' : 'block'}}>
            <PageHeader
                className={styles.pageHeader}
                title={dash.name}
                extra={fullScreen ? (
                    <Button type="link" icon={<FullscreenExitOutlined style={{fontSize: 24}}/>} title={t('Exit full screen')} onClick={() => handleFullScreenChange(false)}/>
                ) : (
                    <Button type="link" icon={<FullscreenOutlined style={{fontSize: 24}}/>} title={t('Full screen')} onClick={() => handleFullScreenChange(true)}/>
                )}
            />

            {fullScreen && (
                <>
                    {datasetItem.temporalType && (
                        <TopPanel title={t('Temporal')} height={60}>
                            <div style={{padding: '16px 8px'}}>
                                <TemporalToolbar temporalType={datasetItem.temporalType} onBeginTemporalChange={setBeginTemporal} onEndTemporalChange={setEndTemporal}/>
                            </div>
                        </TopPanel>
                    )}
                    <LeftPanel title={t('Labels')} width={250}>
                        <div style={{padding: 8}}>
                            <LabelToolbar dataset={datasetItem} data={datasetData} onChange={setFilteredLabelSet}/>
                        </div>
                    </LeftPanel>
                    <RightPanel title={t('Locations')} width={250}>
                        <div style={{padding: 8}}>
                            <LocationToolbar dataset={datasetItem} data={datasetData} onChange={setFilteredLocationLabelSet}/>
                        </div>
                    </RightPanel>
                </>
            )}

            <DashComponent {...props} fullScreen={fullScreen} dataset={datasetItem} data={filteredData}/>
        </FullScreen>
    )
}