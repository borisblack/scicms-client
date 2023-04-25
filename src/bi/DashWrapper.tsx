import _ from 'lodash'
import React, {useEffect, useMemo, useState} from 'react'
import {Dropdown, Empty, Form, Modal, notification, Space, Spin, Tooltip} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'
import {useTranslation} from 'react-i18next'
import 'chartjs-adapter-luxon'
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
import FullScreen from '../components/fullscreen/FullScreen'
import styles from './DashWrapper.module.css'
import DatasetService, {DatasetInput} from '../services/dataset'
import appConfig from '../config'
import {
    fromFormQueryBlock,
    generateQueryBlock,
    getCustomFunctionsInfo,
    printQueryBlock,
    toDatasetFiltersInput
} from '../util/bi'
import {Dash, getDash} from '../extensions/dashes'
import biConfig from '../config/bi'
import FiltersFom, {FiltersFormValues} from './FiltersForm'
import {useAppDispatch, useAppSelector} from '../util/hooks'
import {selectMe, updateSessionData} from '../features/auth/authSlice'

const datasetService = DatasetService.getInstance()

export default function DashWrapper(props: DashProps) {
    const {dataset, dashboard, dash} = props
    const dashHandler: Dash | undefined = useMemo(() => getDash(dash.type), [dash.type])
    if (dashHandler == null)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const me = useAppSelector(selectMe)
    const dispatch = useAppDispatch()
    const [datasetData, setDatasetData] = useState<any[]>([])
    const [fullScreen, setFullScreen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [isFiltersModalVisible, setFiltersModalVisible] = useState(false)
    const sessionFilters = (((((me?.sessionData ?? {}).dashboards ?? {})[dashboard.name] ?? {}).dashes ?? {})[dash.name] ?? {}).filters
    const [filters, setFilters] = useState(sessionFilters ?? dash.defaultFilters ?? generateQueryBlock())
    const [filtersForm] = Form.useForm()
    const dashHeight = (dashHandler.height ?? biConfig.viewRowHeight) * dash.h

    useEffect(() => {
        fetchDatasetData()
    }, [filters])

    useEffect(() => {
        const interval = setInterval(fetchDatasetData, dash.refreshIntervalSeconds * 1000)
        return () => clearInterval(interval)
    }, [dash.refreshIntervalSeconds])

    const fetchDatasetData = async () => {
        if (dash.isAggregate && !dash.aggregateType)
            throw new Error('aggregateType must be specified')

        const datasetInput: DatasetInput<any> = {
            filters: toDatasetFiltersInput(dataset, filters)
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
    }

    const handleFullScreenChange = (fullScreen: boolean) => {
        setFullScreen(fullScreen)
    }

    const renderSubTitle = (): string | null =>
        printQueryBlock(dataset, filters)

    const getSettingsMenuItems = () => [{
        key: 'filters',
        label: <Space><FilterOutlined/>{t('Filters')}</Space>,
        onClick: () => setFiltersModalVisible(true)
    }]

    async function handleFiltersFormFinish(values: FiltersFormValues) {
        const newFilters = fromFormQueryBlock(dataset, values.filters)

        // Set session data
        const sessionData = me?.sessionData ? _.cloneDeep(me.sessionData) : {}
        sessionData.dashboards = sessionData.dashboards ?? {}
        sessionData.dashboards[dashboard.name] = sessionData.dashboards[dashboard.name] ?? {}
        sessionData.dashboards[dashboard.name].dashes = sessionData.dashboards[dashboard.name].dashes ?? {}
        sessionData.dashboards[dashboard.name].dashes[dash.name] = sessionData.dashboards[dashboard.name].dashes[dash.name] ?? {}
        sessionData.dashboards[dashboard.name].dashes[dash.name].filters = newFilters
        dispatch(updateSessionData(sessionData))

        setFilters(newFilters)
        setFiltersModalVisible(false)
    }

    return (
        <>
            <FullScreen active={fullScreen}>
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

                <div style={{margin: fullScreen ? 16 : 0, height: fullScreen ? '90vh' : dashHeight}}>
                    {datasetData.length === 0 ? (
                        <Spin spinning={loading}>
                            <div className={styles.centerChildContainer} style={{height: fullScreen ? '50vh' : dashHeight}}>
                                <Empty/>
                            </div>
                        </Spin>
                    ) : (
                        dashHandler.render({
                            context: {
                                height: dashHeight,
                                fullScreen,
                                data: datasetData,
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