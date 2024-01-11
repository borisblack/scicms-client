import _ from 'lodash'
import React, {memo, useEffect, useMemo, useState} from 'react'
import {Button, Dropdown, Empty, notification, Space, Spin} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'
import {useTranslation} from 'react-i18next'
import {DashWrapperProps} from './index'
import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    FilterOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    ReloadOutlined,
    SettingOutlined,
    SyncOutlined
} from '@ant-design/icons'
import FullScreen from '../components/FullScreen'
import * as DatasetService from '../services/dataset'
import {
    getActualFilters,
    printQueryBlock,
    toDatasetFiltersInput,
    toSingleDatasetFiltersInput
} from './util'
import {Dash, getDash} from '../extensions/dashes'
import biConfig from '../config/bi'
import {DatasetFiltersInput, QueryBlock} from '../types/bi'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import FiltersModal from './FiltersModal'
import DashModal from './DashModal'
import {useModal, usePrevious} from '../util/hooks'
import styles from './DashWrapper.module.css'
import './DashWrapper.css'

const PAGE_HEADER_HEIGHT = 80

function DashWrapper(props: DashWrapperProps) {
    const {
        dataset,
        datasetMap,
        dashboards,
        dashboard,
        extra,
        dash,
        readOnly,
        canEdit,
        onLockChange,
        onDashChange,
        onDelete,
    } = props
    const dashHandler: Dash | undefined = useMemo(() => getDash(dash.type), [dash.type])

    if (dashHandler == null)
        throw new Error('Illegal argument')

    if (!dash.id)
        throw new Error(`Dash [${dash.name}] has no ID`)

    const {t} = useTranslation()
    const [datasetData, setDatasetData] = useState<any[]>([])
    const [fullScreen, setFullScreen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const {show: showDashModal, close: closeDashModal, modalProps: dashModalProps} = useModal()
    const {show: showFiltersModal, close: closeFiltersModal, modalProps: filtersModalProps} = useModal()
    const [filters, setFilters] = useState<QueryBlock>(getActualFilters(dashboard.id, dash))
    const prevDefaultFilters = usePrevious(dash.defaultFilters)
    const dashHeight = biConfig.rowHeight * dash.h - PAGE_HEADER_HEIGHT

    useEffect(() => {
        if (!_.isEqual(dash.defaultFilters, prevDefaultFilters))
            setFilters(getActualFilters(dashboard.id, dash))
    }, [dash.defaultFilters])

    useEffect(() => {
        fetchDatasetData()
    }, [
        dataset,
        dash.isAggregate,
        dash.aggregateType,
        dash.aggregateField,
        dash.groupField,
        dash.sortField,
        filters
    ])

    useEffect(() => {
        const interval = setInterval(fetchDatasetData, dash.refreshIntervalSeconds * 1000)
        return () => clearInterval(interval)
    }, [dash.refreshIntervalSeconds])

    const fetchDatasetData = async () => {
        if (!dataset) {
            console.debug(`No dataset [${dash.dataset}]`)
            return
        }

        if (dash.isAggregate && !dash.aggregateType)
            throw new Error('aggregateType must be specified')

        const datasetInput: DatasetService.DatasetInput<any> = {
            filters: toDatasetFiltersInput(dataset, filters)
        }

        const extraQueryFilter = extra?.queryFilter
        if (extraQueryFilter != null && extraQueryFilter.columnName in dataset.spec.columns) {
            const datasetFiltersInput = datasetInput.filters as DatasetFiltersInput<any>
            const $and = datasetFiltersInput.$and ?? []
            $and.push(toSingleDatasetFiltersInput(dataset, extraQueryFilter))
            datasetFiltersInput.$and = $and
        }

        if (dash.isAggregate) {
            datasetInput.aggregate = dash.aggregateType
            datasetInput.aggregateField = dash.aggregateField

            if (dash.groupField)
                datasetInput.groupFields = Array.isArray(dash.groupField) ? dash.groupField : [dash.groupField]
        }

        if (dash.sortField)
            datasetInput.sort = Array.isArray(dash.sortField) ? dash.sortField : [dash.sortField]

        let fetchedData: any[] | null = null
        setLoading(true)
        try {
            setFetchError(null)
            const datasetResponse = await DatasetService.loadData(dataset.name, datasetInput)
            fetchedData = datasetResponse.data
            setDatasetData(fetchedData)
        } catch (e: any) {
            setFetchError(e.message)
            notification.error({
                message: t('Loading error'),
                description: e.message
            })
        } finally {
            setLoading(false)
        }
    }

    const handleFullScreenChange = (fullScreen: boolean) => {
        setFullScreen(fullScreen)
        onLockChange(fullScreen)
    }

    function handleDashModalOpen() {
        if (!fullScreen)
            onLockChange(true)

        showDashModal()
    }

    function handleDashModalClose() {
        if (!fullScreen)
            onLockChange(false)

        closeDashModal()
    }

    const renderTitle = () => dash.name + (dash.unit ? `, ${dash.unit}` : '')

    const renderSubTitle = () => {
        const queryBlock = dataset ? printQueryBlock(dataset, filters) : ''
        return <div className={styles.subTitle} title={queryBlock}>{queryBlock}</div>
    }

    const getSettingsMenuItems = (): ItemType[] => {
        const menuItems: ItemType[] = []

        if (dataset) {
            menuItems.push({
                key: 'filters',
                label: <Space><FilterOutlined/>{t('Filters')}</Space>,
                onClick: showFiltersModal
            })
        }

        if (!readOnly) {
            menuItems.push({type: 'divider'})
            menuItems.push({
                key: 'edit',
                label: <Space><EditOutlined/>{t('Edit')}</Space>,
                // disabled: !canEdit,
                onClick: handleDashModalOpen
            })
            menuItems.push({
                key: 'delete',
                label: <Space><DeleteOutlined className="red"/>{t('Delete')}</Space>,
                disabled: !canEdit,
                onClick: () => onDelete()
            })
        }

        return menuItems
    }

    async function handleFiltersChange(newFilters: QueryBlock) {
        setFilters(newFilters)
    }

    const title = renderTitle()
    return (
        <>
            <FullScreen active={fullScreen}>
                <PageHeader
                    className={styles.pageHeader}
                    title={(
                        <span className={styles.title} title={title}>
                            {title}
                            {loading && <>&nbsp;&nbsp;<SyncOutlined spin className="blue"/></>}
                            {(!loading && fetchError != null) && <>&nbsp;&nbsp;<ExclamationCircleOutlined className="red" title={fetchError}/></>}
                        </span>
                    )}
                    // subTitle={renderSubTitle()}
                    footer={renderSubTitle()}
                    extra={[
                        <Button
                            key="refresh"
                            type="text"
                            className={styles.toolbarBtn}
                            icon={<ReloadOutlined/>}
                            title={t('Refresh')}
                            onClick={() => fetchDatasetData()}
                            onMouseDown={e => e.stopPropagation()}
                        />,
                        <Dropdown key="settings" placement="bottomRight" trigger={['click']} menu={{items: getSettingsMenuItems()}}>
                            <Button
                                type="text"
                                className={styles.toolbarBtn}
                                icon={<SettingOutlined/>}
                                title={t('Settings')}
                                onMouseDown={e => e.stopPropagation()}
                            />
                        </Dropdown>,
                        fullScreen ? (
                            <Button
                                key="exitFullScreen"
                                type="text"
                                className={styles.toolbarBtn}
                                icon={<FullscreenExitOutlined/>}
                                title={t('Exit full screen')}
                                onClick={() => handleFullScreenChange(false)}
                                onMouseDown={e => e.stopPropagation()}
                            />
                        ) : (
                            <Button
                                key="fullScreen"
                                type="text"
                                className={styles.toolbarBtn}
                                icon={<FullscreenOutlined/>}
                                title={t('Full screen')}
                                onClick={() => handleFullScreenChange(true)}
                                onMouseDown={e => e.stopPropagation()}
                            />
                        )
                    ]}
                />

                <div className={styles.dashContent} style={{height: fullScreen ? '85vh' : dashHeight}}>
                    {datasetData.length === 0 ? (
                        <Spin spinning={loading}>
                            <div className={styles.centerChildContainer} style={{height: fullScreen ? '50vh' : dashHeight}}>
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                            </div>
                        </Spin>
                    ) : (
                        dataset && dashHandler.render({
                            context: {
                                height: dashHeight,
                                fullScreen,
                                data: datasetData,
                                ...props,
                                dataset
                            }
                        })
                    )}
                </div>
            </FullScreen>

            {dataset && (
                <FiltersModal
                    {...filtersModalProps}
                    dash={dash}
                    dataset={dataset}
                    dashboardId={dashboard.id}
                    filters={filters}
                    onChange={handleFiltersChange}
                    onClose={closeFiltersModal}
                />
            )}

            <DashModal
                {...dashModalProps}
                dash={dash}
                datasetMap={datasetMap}
                dashboards={dashboards}
                canEdit={canEdit}
                onChange={onDashChange}
                onClose={handleDashModalClose}
            />
        </>
    )
}

export default memo(DashWrapper)