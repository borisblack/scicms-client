import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {notification} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'
import {useTranslation} from 'react-i18next'
import 'chartjs-adapter-luxon'
import {Column, TemporalPeriod, TemporalType} from '../types'
import {DashOpt, DashRenderer, DashRenderProps} from './dashes'
import {
    ExclamationCircleOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    ReloadOutlined,
    SyncOutlined
} from '@ant-design/icons'
import LeftPanel from '../components/panel/LeftPanel'
import TopPanel from '../components/panel/TopPanel'
import TemporalToolbar from './TemporalToolbar'
import FullScreen from '../components/fullscreen/FullScreen'
import MetricToolbar from './MetricToolbar'
import styles from './DashWrapper.module.css'
import DatasetService, {DatasetInput} from '../services/dataset'
import appConfig from '../config'
import {
    formatTemporalDisplay,
    formatTemporalIso,
    startTemporalFromPeriod,
    temporalPeriodTitles
} from '../util/dashboard'
import dayjs from 'dayjs'
import {getRenderer} from './DashRenderers'

const datasetService = DatasetService.getInstance()

export default function DashWrapper(props: DashRenderProps) {
    const {dataset, dash, isFullScreenComponentExist, onFullScreenComponentStateChange} = props
    const dashRenderer: DashRenderer | null = useMemo(() => getRenderer(dash.type), [dash.type])
    if (dashRenderer == null)
        throw new Error('Illegal argument')

    const metricDashOpt: DashOpt | undefined = useMemo(
        () => dashRenderer.listOpts().find(o => o.name === dashRenderer.getMetricField()),
        [dashRenderer]
    )
    const {t} = useTranslation()
    const datasetColumns: {[name: string]: Column} = useMemo(() => dataset?.spec?.columns ?? {}, [dataset?.spec?.columns])
    const temporalType: TemporalType | undefined = useMemo(
        () => dash.temporalField ? datasetColumns[dash.temporalField]?.type as TemporalType | undefined : undefined,
        [dash.temporalField, datasetColumns])
    const [datasetData, setDatasetData] = useState<any[]>([])
    const [checkedMetricSet, setCheckedMetricSet] = useState<Set<string> | null>(null)
    const isCheckedMetricSetTouched = useRef<boolean>(false)
    const filteredData = useMemo((): any[] => {
        const metricField = dashRenderer.getMetricField()
        return datasetData.filter(it => {
            const hasMetric = checkedMetricSet == null || checkedMetricSet.has(it[metricField])
            return hasMetric
        })
    }, [checkedMetricSet, dashRenderer, datasetData])

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
        if (period !== TemporalPeriod.ARBITRARY && !temporalType)
            throw new Error('The temporalType must be specified')

        if ((startTemporal || endTemporal) && !dash.temporalField)
            throw new Error('The temporalField must be specified')

        if (dash.isAggregate && !dash.aggregateType)
            throw new Error('aggregateType must be specified')

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
            const temporalField = dash.temporalField as string
            datasetInput.filters = datasetInput.filters ?? {}
            datasetInput.filters[temporalField] = datasetInput.filters[temporalField] ?? {}
            datasetInput.filters[temporalField]['$gte'] = formatTemporalIso(startTemporalFromPeriod(period, temporalType as TemporalType), temporalType as TemporalType) as string
            datasetInput.filters[temporalField]['$lte'] = formatTemporalIso(dayjs(), temporalType as TemporalType) as string
        }

        if (dash.isAggregate) {
            datasetInput.aggregate = dash.aggregateType
            datasetInput.aggregateField = dash.aggregateField

            if (dash.groupField)
                datasetInput.groupFields = [dash.groupField]
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

        // Update checked metrics
        // if (metricDashOpt) {
        //     const fetchedMetrics = fetchedData.map(it => it[metricDashOpt.name])
        //     const fetchedMetricSet = new Set(fetchedMetrics)
        //     if (checkedMetricSet == null || !isCheckedMetricSetTouched.current) {
        //         setCheckedMetricSet(fetchedMetricSet)
        //     } else {
        //         const newCheckedLabels = Array.from(checkedMetricSet).filter(it => fetchedMetricSet.has(it))
        //         setCheckedMetricSet(new Set(newCheckedLabels))
        //     }
        // }

    }, [checkedMetricSet, dash, dataset.name, endTemporal, metricDashOpt, period, startTemporal, t, temporalType])

    const handleFullScreenChange = useCallback((fullScreen: boolean) => {
        setFullScreen(fullScreen)
        onFullScreenComponentStateChange(fullScreen)
    }, [onFullScreenComponentStateChange])

    const handleCheckedLabelSetChange = useCallback((checkedLabelSet: Set<string>) => {
        isCheckedMetricSetTouched.current = true
        setCheckedMetricSet(checkedLabelSet)
    }, [])

    const renderSubTitle = useCallback(() => {
        if (temporalType && period === TemporalPeriod.ARBITRARY) {
            if (startTemporal == null && endTemporal == null)
                return null

            const start = formatTemporalDisplay(startTemporal, temporalType )
            const end = formatTemporalDisplay(endTemporal, temporalType)

            return `${start} - ${end}`
        } else {
            return temporalPeriodTitles[period]
        }
    }, [temporalType, endTemporal, period, startTemporal])

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
                    {temporalType && (
                        <TopPanel title={t('Temporal')} height={60}>
                            <div style={{padding: '16px 8px'}}>
                                <TemporalToolbar
                                    temporalType={temporalType}
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

                    {metricDashOpt && (
                        <LeftPanel title={t('Metrics')} width={250}>
                            <div style={{padding: 8}}>
                                <MetricToolbar
                                    data={datasetData}
                                    dash={dash}
                                    metricDashOpt={metricDashOpt}
                                    checkedMetricSet={checkedMetricSet}
                                    onChange={handleCheckedLabelSetChange}
                                />
                            </div>
                        </LeftPanel>
                    )}
                </>
            )}

            <div style={{margin: fullScreen ? 16 : 0, height: fullScreen ? '90vh' : appConfig.dashboard.viewRowHeight * dash.h}}>
                {dashRenderer.render({fullScreen, data: filteredData, ...props})}
            </div>
        </FullScreen>
    )
}