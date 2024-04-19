import _ from 'lodash'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, notification, Space, Typography} from 'antd'
import {FieldTimeOutlined} from '@ant-design/icons'
import md5 from 'crypto-js/md5'

import {
  type DataWithPagination,
  type RequestParams,
  DataGrid
} from 'src/components/DataGrid'
import {getColumns, getHiddenColumns, getInitialData, loadData} from 'src/bi/util/datagrid'
import appConfig from 'src/config'
import {Column, Dataset, ExecutionStatisticInfo} from 'src/types/bi'
import {usePrevious} from 'src/util/hooks'
import ExecutionStatisticModal from 'src/bi/ExecutionStatisticModal'

interface DataPreviewProps {
    dataset: Dataset
    allFields: Record<string, Column>
    height: number
}

const {Title} = Typography

export default function DataPreview(props: DataPreviewProps) {
  const {dataset, allFields, height} = props
  const prevProps = usePrevious(props)
  const {t} = useTranslation()
  const columnsMemoized = useMemo(() => getColumns(allFields), [allFields])
  const hiddenColumnsMemoized = useMemo(() => getHiddenColumns(allFields), [allFields])
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<DataWithPagination<any>>(getInitialData())
  const [version, setVersion] = useState<number>(0)
  const [statistic, setStatistic] = useState<ExecutionStatisticInfo>()
  const [openStatisticModal, setOpenStatisticModal] = useState<boolean>(false)

  useEffect(() => {
    if (!prevProps)
      return

    if (!_.isEqual(prevProps.dataset, dataset) || !_.isEqual(prevProps.allFields, allFields))
      refresh()
  }, [dataset, allFields])

  const refresh = () => setVersion(prevVersion => prevVersion + 1)

  const handleRequest = useCallback(async (params: RequestParams) => {
    try {
      setLoading(true)
      const datasetData = await loadData(dataset, allFields, params)
      setData(datasetData)
      setStatistic({
        timeMs: datasetData.timeMs,
        cacheHit: datasetData.cacheHit,
        query: datasetData.query,
        params: datasetData.params
      })
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Request error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }, [dataset, allFields, t])

  function showStatistic() {
    if (!statistic)
      return

    setOpenStatisticModal(true)
  }

  const renderToolbar = () => (
    <Space size={10}>
      <Title level={5} style={{display: 'inline'}}>{t('Preview')}</Title>
      <Button
        size="small"
        disabled={!statistic}
        icon={<FieldTimeOutlined/>}
        title={t('Execution statistic')}
        onClick={showStatistic}
      />
    </Space>
  )

  return (
    <>
      <DataGrid
        loading={loading}
        columns={columnsMemoized}
        data={data}
        version={version}
        initialState={{
          hiddenColumns: hiddenColumnsMemoized,
          pageSize: appConfig.query.defaultPageSize
        }}
        height={height}
        toolbar={renderToolbar()}
        title={t('Preview')}
        getRowId={originalRow => md5(JSON.stringify(originalRow)).toString()} // TODO: Won't work if rows fully identical
        onRequest={handleRequest}
      />

      {statistic && (
        <ExecutionStatisticModal
          timeMs={statistic.timeMs}
          cacheHit={statistic.cacheHit}
          query={statistic.query}
          params={statistic.params}
          open={openStatisticModal}
          onClose={() => setOpenStatisticModal(false)}
        />
      )}
    </>
  )
}