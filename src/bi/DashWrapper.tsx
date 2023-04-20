import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Dropdown, Form, Modal, notification, Space, Tooltip} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'
import {useTranslation} from 'react-i18next'
import 'chartjs-adapter-luxon'
import {TemporalPeriod, TemporalType} from '../types'
import {DashProps} from './index'
import {
    ExclamationCircleOutlined,
    FilterOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    QuestionCircleOutlined,
    ReloadOutlined,
    SettingOutlined,
    SyncOutlined
} from '@ant-design/icons'
import LeftPanel from '../components/panel/LeftPanel'
import TopPanel from '../components/panel/TopPanel'
import TemporalToolbar from './TemporalToolbar'
import FullScreen from '../components/fullscreen/FullScreen'
import LabelToolbar from './LabelToolbar'
import styles from './DashWrapper.module.css'
import DatasetService, {DatasetInput} from '../services/dataset'
import appConfig from '../config'
import {
    formatTemporalDisplay,
    formatTemporalIso,
    fromFormQueryBlock,
    generateQueryBlock,
    getCustomFunctionsInfo,
    printQueryBlock,
    startTemporalFromPeriod,
    temporalPeriodTitles,
    toDatasetFiltersInput
} from '../util/bi'
import dayjs from 'dayjs'
import {Dash, getDash} from '../extensions/dashes'
import biConfig from '../config/bi'
import FiltersFom, {FiltersFormValues} from './FiltersForm'

const datasetService = DatasetService.getInstance()

export default function DashWrapper(props: DashProps) {
    const {dataset, dash, isFullScreenComponentExist, onFullScreenComponentStateChange} = props
    const dashHandler: Dash | undefined = useMemo(() => getDash(dash.type), [dash.type])
    if (dashHandler == null)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const temporalType: TemporalType | undefined = useMemo(
        () => dash.temporalField ? dataset.spec.columns[dash.temporalField]?.type as TemporalType | undefined : undefined,
        [dash.temporalField, dataset.spec.columns])
    const [datasetData, setDatasetData] = useState<any[]>([])
    const [checkedLabelSet, setCheckedLabelSet] = useState<Set<string> | null>(null)
    const isCheckedMetricSetTouched = useRef<boolean>(false)
    const filteredData = useMemo((): any[] => {
        const label = dash.optValues[dashHandler.labelFieldName]
        return datasetData.filter(it => checkedLabelSet == null || label == null || checkedLabelSet.has(it[label]))
    }, [checkedLabelSet, dash.optValues, dashHandler.labelFieldName, datasetData])

    const [fullScreen, setFullScreen] = useState<boolean>(false)
    const [period, setPeriod] = useState<TemporalPeriod>(dash.defaultPeriod ?? TemporalPeriod.ARBITRARY)
    const [startTemporal, setStartTemporal] = useState<string | null>(dash.defaultStartTemporal ?? null)
    const [endTemporal, setEndTemporal] = useState<string | null>(dash.defaultEndTemporal ?? null)
    const [loading, setLoading] = useState<boolean>(false)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [isFiltersModalVisible, setFiltersModalVisible] = useState(false)
    const [filters, setFilters] = useState(dash.defaultFilters ?? generateQueryBlock())
    const [filtersForm] = Form.useForm()

    useEffect(() => {
        setPeriod(dash.defaultPeriod ?? TemporalPeriod.ARBITRARY)
    }, [dash.defaultPeriod])

    useEffect(() => {
        fetchDatasetData()
    }, [filters, period, startTemporal, endTemporal])

    useEffect(() => {
        const interval = setInterval(fetchDatasetData, dash.refreshIntervalSeconds * 1000)
        return () => clearInterval(interval)
    }, [dash.refreshIntervalSeconds])

    const fetchDatasetData = async () => {
        if (period !== TemporalPeriod.ARBITRARY && !temporalType)
            throw new Error('The temporalType must be specified')

        if ((startTemporal || endTemporal) && !dash.temporalField)
            throw new Error('The temporalField must be specified')

        if (dash.isAggregate && !dash.aggregateType)
            throw new Error('aggregateType must be specified')

        const datasetInput: DatasetInput<any> = {}

        // Filters
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

        datasetInput.filters = {
            ...datasetInput.filters,
            ...toDatasetFiltersInput(dataset, filters)
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

        // Update checked labels
        const labelName = dash.optValues[dashHandler.labelFieldName]
        if (labelName) {
            const fetchedLabels = fetchedData.map(it => it[labelName])
            const fetchedLabelSet = new Set(fetchedLabels)
            if (checkedLabelSet == null || !isCheckedMetricSetTouched.current) {
                setCheckedLabelSet(fetchedLabelSet)
            } else {
                const newCheckedLabels = Array.from(checkedLabelSet).filter(it => fetchedLabelSet.has(it))
                setCheckedLabelSet(new Set(newCheckedLabels))
            }
        }

    }

    const handleFullScreenChange = useCallback((fullScreen: boolean) => {
        setFullScreen(fullScreen)
        onFullScreenComponentStateChange(fullScreen)
    }, [onFullScreenComponentStateChange])

    const handleCheckedLabelSetChange = useCallback((checkedLabelSet: Set<string>) => {
        isCheckedMetricSetTouched.current = true
        setCheckedLabelSet(checkedLabelSet)
    }, [])

    function renderSubTitle(): string | null {
        let temporalSubTitle: string | null = null
        if (temporalType) {
            if (period === TemporalPeriod.ARBITRARY) {
                if (startTemporal == null && endTemporal == null)
                    return null

                const start = formatTemporalDisplay(startTemporal, temporalType)
                const end = formatTemporalDisplay(endTemporal, temporalType)
                temporalSubTitle = `${start} - ${end}`
            } else {
                temporalSubTitle = temporalPeriodTitles[period]
            }
        }

        const filtersSubTitle = printQueryBlock(dataset, filters)
        if (temporalSubTitle != null && filtersSubTitle != null)
            return `${temporalSubTitle} ${t('and')} ${filtersSubTitle}`
        else
            return temporalSubTitle ?? filtersSubTitle
    }

    const getSettingsMenuItems = () => [{
        key: 'filters',
        label: <Space><FilterOutlined/>{t('Filters')}</Space>,
        onClick: () => setFiltersModalVisible(true)
    }]

    function handleFiltersFormFinish(values: FiltersFormValues) {
        setFilters(fromFormQueryBlock(dataset, values.filters))
        setFiltersModalVisible(false)
    }

    return (
        <>
            <FullScreen active={fullScreen} normalStyle={{display: isFullScreenComponentExist ? 'none' : 'block'}}>
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
                        <Dropdown key="settings" placement="bottomRight" trigger={['click']} menu={{items: getSettingsMenuItems()}}>
                            <SettingOutlined className={styles.toolbarBtn} title={t('Settings')}/>
                        </Dropdown>,
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

                        <LeftPanel title={t('Labels')} width={250}>
                            <div style={{padding: 8}}>
                                <LabelToolbar
                                    dataset={dataset}
                                    dash={dash}
                                    data={datasetData}
                                    labelFieldName={dashHandler.labelFieldName}
                                    checkedLabelSet={checkedLabelSet}
                                    onChange={handleCheckedLabelSetChange}
                                />
                            </div>
                        </LeftPanel>
                    </>
                )}

                <div style={{margin: fullScreen ? 16 : 0, height: fullScreen ? '90vh' : biConfig.viewRowHeight * dash.h}}>
                    {filteredData.length > 0 && (
                        dashHandler.render({
                            context: {
                                fullScreen,
                                data: filteredData,
                                ...props
                            }
                        })
                    )}
                </div>
            </FullScreen>

            <Modal
                title={(
                    <Space style={{fontSize: 16}}>
                        {t('Filters')}
                        <Tooltip
                            placement="rightBottom"
                            overlayInnerStyle={{width: 400}}
                            title={<>{getCustomFunctionsInfo().map((s, i) => <div key={i}>{s}</div>)}</>}
                        >
                            <QuestionCircleOutlined className="blue"/>
                        </Tooltip>
                    </Space>
                )}
                open={isFiltersModalVisible}
                width={1280}
                onOk={() => filtersForm.submit()}
                onCancel={() => setFiltersModalVisible(false)}
            >
                <FiltersFom
                    form={filtersForm}
                    dataset={dataset}
                    defaultFilters={filters}
                    onFormFinish={handleFiltersFormFinish}
                />
            </Modal>
        </>
    )
}