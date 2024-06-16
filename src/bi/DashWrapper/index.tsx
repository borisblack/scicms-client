import _ from 'lodash'
import React, {useEffect, useMemo, useState} from 'react'
import {Button, Dropdown, Empty, notification, Space, Spin} from 'antd'
import {PageHeader} from '@ant-design/pro-layout'
import {useTranslation} from 'react-i18next'
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined, FieldTimeOutlined,
  FilterOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  SettingOutlined,
  SyncOutlined
} from '@ant-design/icons'

import FullScreen from 'src/uiKit/FullScreen'
import * as DatasetService from 'src/services/dataset'
import {getActualFilters, printQueryBlock, toDatasetFiltersInput, toSingleDatasetFiltersInput, toSingleSelectorFiltersInput} from '../util'
import {Dash, getDash} from 'src/extensions/dashes'
import {
  Column,
  Dashboard,
  DashboardExtra,
  Dataset,
  DatasetFiltersInput,
  ExecutionStatisticInfo,
  IDash,
  QueryBlock,
  SelectorFilter
} from 'src/types/bi'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import FiltersModal from '../FiltersModal'
import DashModal from '../DashModal'
import {useAppProperties, useModal, usePrevious} from 'src/util/hooks'
import {buildFieldsInput} from '../util/datagrid'
import ExecutionStatisticModal from '../ExecutionStatisticModal'
import styles from './DashWrapper.module.css'
import './DashWrapper.css'
import {useBiProperties} from '../util/hooks'

export interface DashWrapperProps {
  pageKey: string
  datasetMap: Record<string, Dataset>
  dashboards: Dashboard[]
  dataset?: Dataset
  dashboard: Dashboard
  dash: IDash
  height: number
  extra?: DashboardExtra
  selectedFilters?: SelectorFilter[]
  readOnly: boolean
  canEdit: boolean
  onLockChange: (locked: boolean) => void
  onDashClick: (value: any) => void
  onDashChange: (dash: IDash) => void
  onDelete: () => void
}

const PAGE_HEADER_HEIGHT = 80

function DashWrapper(props: DashWrapperProps) {
  const {
    dataset,
    datasetMap,
    dashboards,
    dashboard,
    extra,
    selectedFilters,
    dash,
    height,
    readOnly,
    canEdit,
    onLockChange,
    onDashChange,
    onDelete
  } = props
  const dashHandler: Dash | undefined = useMemo(() => getDash(dash.type), [dash.type])

  if (dashHandler == null)
    throw new Error('Illegal argument')

  if (!dash.id)
    throw new Error(`Dash [${dash.name}] has no ID`)

  const {t} = useTranslation()
  const appProps = useAppProperties()
  const {timeZone} = appProps.dateTime
  const [datasetData, setDatasetData] = useState<any[]>([])
  const [fullScreen, setFullScreen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const {show: showDashModal, close: closeDashModal, modalProps: dashModalProps} = useModal()
  const {show: showFiltersModal, close: closeFiltersModal, modalProps: filtersModalProps} = useModal()
  const [statistic, setStatistic] = useState<ExecutionStatisticInfo>()
  const {show: showStatisticModal, close: closeStatisticModal, modalProps: statisticModalProps} = useModal()
  const [filters, setFilters] = useState<QueryBlock>(getActualFilters(dashboard.id, dash))
  const prevDefaultFilters = usePrevious(dash.defaultFilters)
  const biProps = useBiProperties()
  const {dateFormatString, timeFormatString, dateTimeFormatString} = biProps.dateTime
  const {rowHeight} = biProps
  const dashHeight = rowHeight * height - PAGE_HEADER_HEIGHT

  useEffect(() => {
    if (!_.isEqual(dash.defaultFilters, prevDefaultFilters))
      setFilters(getActualFilters(dashboard.id, dash))
  }, [dash.defaultFilters])

  useEffect(() => {
    fetchDatasetData()
  }, [
    dataset,
    dash.sortField,
    filters,
    selectedFilters
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

    const datasetInput: DatasetService.DatasetInput<any> = {
      filters: toDatasetFiltersInput(dataset, filters, timeZone)
    }

    const extraQueryFilter = extra?.queryFilter
    if (extraQueryFilter != null && extraQueryFilter.columnName in dataset.spec.columns) {
      const datasetFiltersInput = datasetInput.filters as DatasetFiltersInput<any>
      const $and = datasetFiltersInput.$and ?? []
      $and.push(toSingleDatasetFiltersInput(dataset, extraQueryFilter, timeZone))
      datasetFiltersInput.$and = $and
    }

    if (selectedFilters != null && selectedFilters.length > 0) {
      const datasetFiltersInput = datasetInput.filters as DatasetFiltersInput<any>
      const $and = datasetFiltersInput.$and ?? []
      selectedFilters
        .filter(selectedFilter => {
          const field = dataset.spec.columns[selectedFilter.field]
          if (field == null)
            return false

          return field.type === selectedFilter.type
        })
        .forEach(selectedFilter => {
          $and.push(toSingleSelectorFiltersInput(selectedFilter, timeZone))
        })
      datasetFiltersInput.$and = $and
    }

    const datasetFields = dataset.spec.columns ?? {}
    const allFields = {...datasetFields, ...dash.fields}
    const sortFieldNames: string[] = (dash.sortField ? (Array.isArray(dash.sortField) ? dash.sortField : [dash.sortField]) : [])
      .map(sf => sf.includes(':') ? sf.substring(0, sf.indexOf(':')) : sf)
    const fieldNamesToFetch: Set<string> = new Set(sortFieldNames)
    for (const axis of dashHandler.axes) {
      const axisValue: string | string[] | undefined = dash.optValues[axis.name]
      if (!axisValue)
        continue

      if (Array.isArray(axisValue))
        axisValue.forEach(v => fieldNamesToFetch.add(v))
      else
        fieldNamesToFetch.add(axisValue)

      const fieldsToFetch: Record<string, Column>
                = _.pickBy(allFields, (field, fieldName) => fieldNamesToFetch.has(fieldName))

      datasetInput.fields = buildFieldsInput(fieldsToFetch)
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
      setStatistic({
        timeMs: datasetResponse.timeMs,
        cacheHit: datasetResponse.cacheHit,
        query: datasetResponse.query,
        params: datasetResponse.params
      })
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
    const queryBlock = dataset ? printQueryBlock({dataset, queryBlock: filters, dateFormatString, timeFormatString, dateTimeFormatString, timezone: timeZone}) : ''
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
      if (dataset) {
        menuItems.push({
          key: 'statistic',
          label: <Space><FieldTimeOutlined/>{t('Execution statistic')}</Space>,
          onClick: showStatisticModal
        })
      }
            
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
                fullScreen,
                data: datasetData,
                dataset,
                ...props,
                height: dashHeight
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

      {statistic && (
        <ExecutionStatisticModal
          {...statisticModalProps}
          timeMs={statistic.timeMs}
          cacheHit={statistic.cacheHit}
          query={statistic.query}
          params={statistic.params}
          onClose={closeStatisticModal}
        />
      )}
    </>
  )
}

export default DashWrapper