import _ from 'lodash'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {notification, Typography} from 'antd'

import DataGrid, {RequestParams} from 'src/components/datagrid/DataGrid'
import {getColumns, getHiddenColumns, getInitialData, loadData} from 'src/bi/util/datagrid'
import appConfig from 'src/config'
import {Column, Dataset} from 'src/types/bi'
import {usePrevious} from '../../../../util/hooks'

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
    const [data, setData] = useState(getInitialData())
    const [version, setVersion] = useState<number>(0)

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
            const dataWithPagination = await loadData(dataset, allFields, params)
            setData(dataWithPagination)
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

    return (
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
            toolbar={<Title level={5} style={{display: 'inline'}}>{t('Preview')}</Title>}
            title={t('Preview')}
            onRequest={handleRequest}
        />
    )
}