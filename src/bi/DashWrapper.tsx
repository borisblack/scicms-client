import React, {useEffect, useMemo, useState} from 'react'
import {Button, Dropdown, Empty, Form, Modal, notification, Space, Spin, Tooltip} from 'antd'
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
    QuestionCircleOutlined,
    ReloadOutlined,
    SettingOutlined,
    SyncOutlined
} from '@ant-design/icons'
import FullScreen from '../components/fullscreen/FullScreen'
import * as DatasetService from '../services/dataset'
import {
    fromFormQueryBlock,
    generateQueryBlock,
    getCustomFunctionsInfo,
    printQueryBlock,
    toDatasetFiltersInput,
    toSingleDatasetFiltersInput
} from '../util/bi'
import {Dash, getDash} from '../extensions/dashes'
import biConfig from '../config/bi'
import FiltersFom, {FiltersFormValues} from './FiltersForm'
import {assign, extract} from '../util'
import {DatasetFiltersInput, QueryBlock} from '../types'
import styles from './DashWrapper.module.css'
import './DashWrapper.css'
import {ItemType} from 'antd/es/menu/hooks/useItems'

const PAGE_HEADER_HEIGHT = 80

const extractSessionData = () => JSON.parse(localStorage.getItem('sessionData') ?? '{}')

export default function DashWrapper(props: DashWrapperProps) {
    const {
        dataset,
        dashboard,
        extra,
        dash,
        readOnly,
        canEdit,
        onFullScreenChange,
        onEdit,
        onDelete
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
    const [isFiltersModalVisible, setFiltersModalVisible] = useState(false)
    const sessionFilters = useMemo(() => extract(extractSessionData(), ['dashboards', dashboard.id, 'dashes', dash.id, 'filters']), [dash.id, dashboard.id])
    const [filters, setFilters] = useState<QueryBlock>(sessionFilters ?? dash.defaultFilters ?? generateQueryBlock())
    const [filtersForm] = Form.useForm()
    const dashHeight = biConfig.rowHeight * dash.h - PAGE_HEADER_HEIGHT

    useEffect(() => {
        setFilters(sessionFilters ?? dash.defaultFilters ?? generateQueryBlock())
    }, [dash.defaultFilters, sessionFilters])

    useEffect(() => {
        fetchDatasetData()
    }, [
        dataset,
        dash.isAggregate,
        dash.aggregateType,
        dash.aggregateField,
        dash.groupField,
        dash.sortField,
        dash.sortDirection,
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
                datasetInput.groupFields = [dash.groupField]
        }

        if (dash.sortField)
            datasetInput.sort = [`${dash.sortField}:${dash.sortDirection ?? 'asc'}`]

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
        onFullScreenChange(fullScreen)
    }

    const renderTitle = () => dash.name + (dash.unit ? `, ${dash.unit}` : '')

    const renderSubTitle = () => {
        const queryBlock = dataset ? printQueryBlock(dataset, filters) : ''
        return <div className={styles.subTitle} title={queryBlock}>{queryBlock}</div>
    }

    const getSettingsMenuItems = (): ItemType[] => {
        const menuItems: ItemType[] = [{
            key: 'filters',
            label: <Space><FilterOutlined/>{t('Filters')}</Space>,
            onClick: () => setFiltersModalVisible(true)
        }]

        if (!readOnly) {
            menuItems.push({type: 'divider'})
            menuItems.push({
                key: 'edit',
                label: <Space><EditOutlined/>{t('Edit')}</Space>,
                // disabled: !canEdit,
                onClick: () => onEdit()
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

    async function handleFiltersFormFinish(values: FiltersFormValues) {
        if (!dataset)
            return

        const newFilters = fromFormQueryBlock(dataset, values.filters)

        // Set session data
        const newSessionData = extractSessionData()
        assign(newSessionData, ['dashboards', dashboard.id, 'dashes', dash.id, 'filters'], newFilters)
        localStorage.setItem('sessionData', JSON.stringify(newSessionData))

        setFilters(newFilters) // if we use server session data, it should be update in useEffect()
        setFiltersModalVisible(false)
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
                <Modal
                    title={(
                        <Space style={{fontSize: 16}}>
                            {t('Filters')}
                            <Tooltip
                                placement="rightBottom"
                                overlayInnerStyle={{width: 600}}
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
            )}
        </>
    )
}