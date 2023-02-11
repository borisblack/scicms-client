import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {notification} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'
import {useTranslation} from 'react-i18next'
import 'chartjs-adapter-luxon'
import {DashType, TemporalPeriod, TemporalType} from '../types'
import {DashMap, DashProps} from './dashes'
import BarDash from './dashes/BarDash'
import DoughnutDash from './dashes/DoughnutDash'
import PieDash from './dashes/PieDash'
import LineDash from './dashes/LineDash'
import BubbleDash from './dashes/BubbleDash'
import ColumnDash from './dashes/ColumnDash'
import PolarAreaDash from './dashes/PolarAreaDash'
import RadarDash from './dashes/RadarDash'
import ScatterDash from './dashes/ScatterDash'
import BubbleMapDash from './dashes/BubbleMapDash'
import {
    ExclamationCircleOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    ReloadOutlined,
    SyncOutlined
} from '@ant-design/icons'
import RightPanel from '../components/panel/RightPanel'
import LeftPanel from '../components/panel/LeftPanel'
import TopPanel from '../components/panel/TopPanel'
import TemporalToolbar from './TemporalToolbar'
import FullScreen from '../components/fullscreen/FullScreen'
import LabelToolbar from './LabelToolbar'
import LocationToolbar from './LocationToolbar'
import StatisticDash from './dashes/StatisticDash'
import AreaDash from './dashes/AreaDash'
import styles from './DashWrapper.module.css'
import DatasetService, {DatasetInput} from '../services/dataset'
import appConfig from '../config'
import {formatTemporal, parseTemporal, startTemporalFromPeriod, temporalPeriodTitles} from '../util/dashboard'

const dashMap: DashMap = {
    [DashType.area]: AreaDash,
    [DashType.bar]: BarDash,
    [DashType.bubble]: BubbleDash,
    [DashType.bubbleMap]: BubbleMapDash,
    [DashType.column]: ColumnDash,
    [DashType.doughnut]: DoughnutDash,
    [DashType.line]: LineDash,
    [DashType.pie]: PieDash,
    [DashType.polarArea]: PolarAreaDash,
    [DashType.radar]: RadarDash,
    [DashType.radar]: RadarDash,
    [DashType.scatter]: ScatterDash,
    [DashType.statistic]: StatisticDash
}

const datasetService = DatasetService.getInstance()

export default function DashWrapper(props: DashProps) {
    const {dataset, dash, isFullScreenComponentExist, onFullScreenComponentStateChange} = props
    const getDashComponent = useCallback(() => dashMap[dash.type], [dash.type])
    const DashComponent = getDashComponent()
    if (DashComponent == null)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
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
    const [period, setPeriod] = useState<TemporalPeriod>(dash.defaultPeriod ?? TemporalPeriod.ARBITRARY)
    const [startTemporal, setStartTemporal] = useState<string | null>(dash.defaultStartTemporal ?? null)
    const [endTemporal, setEndTemporal] = useState<string | null>(dash.defaultEndTemporal ?? null)
    const [loading, setLoading] = useState<boolean>(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    useEffect(() => {
        fetchDatasetData()
    }, [dataset, period, startTemporal, endTemporal])

    useEffect(() => {
        const interval = setInterval(fetchDatasetData, dash.refreshIntervalSeconds * 1000)
        return () => clearInterval(interval)
    }, [dash.refreshIntervalSeconds])

    const fetchDatasetData = useCallback(async () => {
        if (period !== TemporalPeriod.ARBITRARY && !dash.temporalType)
            throw new Error('The temporalType must be specified')

        if ((startTemporal || endTemporal) && !dash.temporalField)
            throw new Error('The temporalField must be specified')

        if (dash.isAggregate && (!dash.aggregateType || !dash.metricField))
            throw new Error('aggregateType and metricField must be specified')

        const datasetInput: DatasetInput<any> = {}

        if (period === TemporalPeriod.ARBITRARY) {
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
        } else {
            const temporalType = dash.temporalType as TemporalType
            const temporalField = dash.temporalField as string
            datasetInput.filters = datasetInput.filters ?? {}
            datasetInput.filters[temporalField] = datasetInput.filters[temporalField] ?? {}
            datasetInput.filters[temporalField]['$gte'] = parseTemporal(startTemporalFromPeriod(period, temporalType), temporalType) as string
        }

        if (dash.isAggregate) {
            datasetInput.aggregate = dash.aggregateType
            datasetInput.aggregateField = dash.metricField

            if (dash.labelField)
                datasetInput.groupField = dash.labelField
        }

        if (dash.sortField)
            datasetInput.sort = [`${dash.sortField}:${dash.sortDirection ?? 'asc'}`]

        let fetchedData: any[] | null = null
        setLoading(true)
        try {
            setFetchError(null)
            const datasetResponse = await datasetService.loadData(dataset.name, datasetInput)
            fetchedData = datasetResponse.data
            setDatasetData(fetchedData)
        } catch (e: any) {
            setFetchError(e.message)
            notification.error({
                message: t('Loading error'),
                description: e.message,
                duration: appConfig.ui.notificationDuration,
                placement: appConfig.ui.notificationPlacement
            })
        } finally {
            setLoading(false)
        }

        if (fetchedData == null) {
            return
        }

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

    }, [checkedLabelSet, checkedLocationLabelSet, dash, dataset.name, period, endTemporal, startTemporal, t])

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

    const renderSubTitle = useCallback(() => {
        if (period === TemporalPeriod.ARBITRARY) {
            if (startTemporal == null && endTemporal == null)
                return null

            const start = formatTemporal(startTemporal, dash.temporalType as TemporalType)
            const end = formatTemporal(endTemporal, dash.temporalType as TemporalType)

            return `${start} - ${end}`
        } else {
            return temporalPeriodTitles[period]
        }
    }, [dash.temporalType, endTemporal, period, startTemporal])

    return (
        <FullScreen active={fullScreen} normalStyle={{display: isFullScreenComponentExist ? 'none' : 'block'}}
        >
            <PageHeader
                className={styles.pageHeader}
                title={(
                    <>
                        {dash.name + (dash.unit ? `, ${dash.unit}` : '')}
                        {loading && <>&nbsp;&nbsp;<SyncOutlined spin className="blue"/></>}
                        {(!loading && fetchError != null) && <>&nbsp;&nbsp;<ExclamationCircleOutlined className="red" title={fetchError}/></>}
                    </>
                )}
                subTitle={renderSubTitle()}
                extra={[
                    <ReloadOutlined key="refresh" className={styles.toolbarBtn} title={t('Refresh')} onClick={() => fetchDatasetData()}/>,
                    // <Popover
                    //     key="settings"
                    //     content={(
                    //         <div>
                    //             <p>Content</p>
                    //             <p>Content</p>
                    //         </div>
                    //     )}
                    //     placement='bottomRight'
                    //     trigger='click'
                    // >
                    //     <SettingOutlined className={styles.toolbarBtn} title={t('Settings')}/>
                    // </Popover>,
                    fullScreen ? (
                        <FullscreenExitOutlined key="exitFullScreen" className={styles.toolbarBtn} title={t('Exit full screen')} onClick={() => handleFullScreenChange(false)}/>
                    ) : (
                        <FullscreenOutlined key="fullScreen" className={styles.toolbarBtn} title={t('Full screen')} onClick={() => handleFullScreenChange(true)}/>
                    )
                ]}
            />

            {fullScreen && (
                <>
                    {dash.temporalType && (
                        <TopPanel title={t('Temporal')} height={60}>
                            <div style={{padding: '16px 8px'}}>
                                <TemporalToolbar
                                    temporalType={dash.temporalType}
                                    period={period}
                                    startTemporal={startTemporal}
                                    endTemporal={endTemporal}
                                    onPeriodChange={setPeriod}
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

            <div style={{margin: fullScreen ? 16 : 0, height: fullScreen ? '90vh' : appConfig.dashboard.viewRowHeight * dash.h}}>
                <DashComponent {...props} fullScreen={fullScreen} data={filteredData}/>
            </div>
        </FullScreen>
    )
}