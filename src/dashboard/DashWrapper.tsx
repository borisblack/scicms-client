import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import 'chartjs-adapter-luxon'
import {AttrType, DashType} from '../types'
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
import DatasetService, {DatasetInput} from '../services/dataset'
import {DateTime} from 'luxon'
import appConfig from '../config'

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
    const {dataset, dash, isFullScreenComponentExist, onFullScreenComponentStateChange} = props
    const getDashComponent = useCallback(() => dashMap[dash.type], [dash.type])
    const DashComponent = getDashComponent()
    if (DashComponent == null)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const datasetService = useMemo(() => DatasetService.getInstance(), [])
    const [datasetData, setDatasetData] = useState<any[]>([])
    const [checkedLabelSet, setCheckedLabelSet] = useState<Set<string> | null>(null)
    const isCheckedLabelSetTouched = useRef<boolean>(false)
    const [checkedLocationLabelSet, setCheckedLocationLabelSet] = useState<Set<string> | null>(null)
    const isCheckedLocationLabelSetTouched = useRef<boolean>(false)
    const filteredData = useMemo((): any[] => {
        const {labelField, locationField} = dash
        return datasetData.filter(it => {
            const hasLabel = checkedLabelSet == null || labelField == null || checkedLabelSet.has(it[labelField])
            const hasLocationLabel = checkedLocationLabelSet == null || locationField == null || checkedLocationLabelSet.has(it[locationField])
            return hasLabel && hasLocationLabel
        })
    }, [checkedLabelSet, checkedLocationLabelSet, dash, datasetData])

    const [fullScreen, setFullScreen] = useState<boolean>(false)
    const [startTemporal, setStartTemporal] = useState<string | null>(null)
    const [endTemporal, setEndTemporal] = useState<string | null>(null)

    useEffect(() => {
        fetchDatasetData()
    }, [dataset, startTemporal, endTemporal])

    useEffect(() => {
        const interval = setInterval(fetchDatasetData, dash.refreshIntervalSeconds * 1000)
        return () => clearInterval(interval)
    }, [dash.refreshIntervalSeconds])

    const fetchDatasetData = useCallback(async () => {
        if ((startTemporal || endTemporal) && !dash.temporalField)
            throw new Error('The temporalField must be specified')

        if (dash.isAggregate && (!dash.aggregateType || !dash.metricField))
            throw new Error('aggregateType and metricField must be specified')

        const datasetInput: DatasetInput<any> = {}
        if (startTemporal) {
            const temporalField = dash.temporalField as string
            datasetInput.filters = datasetInput.filters ?? {}
            datasetInput.filters[temporalField] = datasetInput.filters[temporalField] ?? {}
            datasetInput.filters[temporalField]['$gte'] = startTemporal
        }

        if (endTemporal) {
            const temporalField = dash.temporalField as string
            datasetInput.filters = datasetInput.filters ?? {}
            datasetInput.filters[temporalField] = datasetInput.filters[temporalField] ?? {}
            datasetInput.filters[temporalField]['$lte'] = endTemporal
        }

        if (dash.temporalField)
            datasetInput.sort = [`${dash.temporalField}:asc`]

        if (dash.isAggregate) {
            datasetInput.aggregate = dash.aggregateType
            datasetInput.aggregateField = dash.metricField

            if (dash.labelField)
                datasetInput.groupField = dash.labelField
        }

        const datasetResponse = await datasetService.loadData(dataset.name, datasetInput)
        const fetchedData = datasetResponse.data
        setDatasetData(fetchedData)

        // Update checked labels and locations
        const {labelField, locationField} = dash
        if (labelField) {
            const fetchedLabels = fetchedData.map(it => it[labelField])
            const fetchedLabelSet = new Set(fetchedLabels)
            if (checkedLabelSet == null || !isCheckedLabelSetTouched.current) {
                setCheckedLabelSet(fetchedLabelSet)
            } else {
                const newCheckedLabels = Array.from(checkedLabelSet).filter(it => fetchedLabelSet.has(it))

                setCheckedLabelSet(new Set(newCheckedLabels))
            }
        }

        // Update checked location labels
        if (locationField) {
            const fetchedLocationLabels = fetchedData.map(it => it[locationField])
            const fetchedLocationLabelSet = new Set(fetchedLocationLabels)
            if (checkedLocationLabelSet == null || !isCheckedLocationLabelSetTouched.current) {
                setCheckedLocationLabelSet(fetchedLocationLabelSet)
            } else {
                const newCheckedLocationLabels = Array.from(checkedLocationLabelSet).filter(it => fetchedLocationLabelSet.has(it))
                setCheckedLabelSet(new Set(newCheckedLocationLabels))
            }
        }

    }, [checkedLabelSet, checkedLocationLabelSet, dash, dataset.name, datasetService, endTemporal, startTemporal])

    const handleFullScreenChange = useCallback((fullScreen: boolean) => {
        setFullScreen(fullScreen)
        onFullScreenComponentStateChange(fullScreen)
    }, [onFullScreenComponentStateChange])

    const handleCheckedLabelSetChange = useCallback((checkedLabelSet: Set<string>) => {
        isCheckedLabelSetTouched.current = true
        setCheckedLabelSet(checkedLabelSet)
    }, [])

    const handleCheckedLocationLabelSetChange = useCallback((checkedLocationLabelSet: Set<string>) => {
        isCheckedLocationLabelSetTouched.current = true
        setCheckedLocationLabelSet(checkedLocationLabelSet)
    }, [])

    const formatTemporal = useCallback((temporal: string | null) => {
        if (temporal == null)
            return ''

        const dt = DateTime.fromISO(temporal)
        if (dash.temporalType === AttrType.date)
            return dt.toFormat(appConfig.dateTime.luxonDisplayDateFormatString)
        else if (dash.temporalType === AttrType.time)
            return dt.toFormat(appConfig.dateTime.luxonDisplayTimeFormatString)
        else
            return dt.toFormat(appConfig.dateTime.luxonDisplayDateTimeFormatString)
    }, [dash.temporalType])

    const renderSubTitle = useCallback(() => {
        if (startTemporal == null && endTemporal == null)
            return null

        const start = formatTemporal(startTemporal)
        const end = formatTemporal(endTemporal)

        return `${start} - ${end}`
    }, [endTemporal, formatTemporal, startTemporal])

    return (
        <FullScreen active={fullScreen} normalStyle={{display: isFullScreenComponentExist ? 'none' : 'block'}}>
            <PageHeader
                className={styles.pageHeader}
                title={dash.name}
                subTitle={renderSubTitle()}
                extra={fullScreen ? (
                    <Button type="link" icon={<FullscreenExitOutlined style={{fontSize: 24}}/>} title={t('Exit full screen')} onClick={() => handleFullScreenChange(false)}/>
                ) : (
                    <Button type="link" icon={<FullscreenOutlined style={{fontSize: 24}}/>} title={t('Full screen')} onClick={() => handleFullScreenChange(true)}/>
                )}
            />

            {fullScreen && (
                <>
                    {dash.temporalType && (
                        <TopPanel title={t('Temporal')} height={60}>
                            <div style={{padding: '16px 8px'}}>
                                <TemporalToolbar
                                    temporalType={dash.temporalType}
                                    startTemporal={startTemporal}
                                    endTemporal={endTemporal}
                                    onStartTemporalChange={setStartTemporal}
                                    onEndTemporalChange={setEndTemporal}
                                />
                            </div>
                        </TopPanel>
                    )}
                    <LeftPanel title={t('Labels')} width={250}>
                        <div style={{padding: 8}}>
                            <LabelToolbar
                                dataset={dataset}
                                data={datasetData}
                                dash={dash}
                                checkedLabelSet={checkedLabelSet}
                                onChange={handleCheckedLabelSetChange}
                            />
                        </div>
                    </LeftPanel>
                    <RightPanel title={t('Locations')} width={250}>
                        <div style={{padding: 8}}>
                            <LocationToolbar
                                dataset={dataset}
                                data={datasetData}
                                dash={dash}
                                checkedLocationLabelSet={checkedLocationLabelSet}
                                onChange={handleCheckedLocationLabelSetChange}
                            />
                        </div>
                    </RightPanel>
                </>
            )}

            <DashComponent {...props} fullScreen={fullScreen} data={filteredData}/>
        </FullScreen>
    )
}