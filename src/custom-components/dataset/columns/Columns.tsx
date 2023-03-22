import {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {CustomComponentRenderContext} from '../../index'
import {DATASET_ITEM_NAME} from '../../../config/constants'
import DataGrid, {DataWithPagination, RequestParams} from '../../../components/datagrid/DataGrid'
import appConfig from '../../../config'
import {
    getColumnColumns,
    getHiddenColumnColumns,
    getInitialData,
    NamedColumn,
    processLocal
} from '../../../util/datagrid'
import {DatasetSpec} from '../../../types'

export default function Columns({item, buffer, data}: CustomComponentRenderContext) {
    if (item.name !== DATASET_ITEM_NAME)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const spec: DatasetSpec = useMemo(() => buffer.spec ?? data?.spec ?? {}, [buffer.spec, data?.spec])
    const [version, setVersion] = useState<number>(0)
    const columns = useMemo(() => getColumnColumns(), [])
    const hiddenColumns = useMemo(() => getHiddenColumnColumns(), [])
    const namedColumns = useMemo((): NamedColumn[] => {
        const columns = spec.columns ?? {}
        return Object.keys(columns).map(colName => ({name: colName, ...columns[colName]}))
    }, [spec.columns])
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedColumn>>(getInitialData())

    useEffect(() => {
        setVersion(prevVersion => prevVersion + 1)
    }, [data?.spec])

    const handleRequest = useCallback(async (params: RequestParams) => {
        setFilteredData(processLocal(namedColumns, params))
    }, [namedColumns])

    return (
        <DataGrid
            columns={columns}
            data={filteredData}
            initialState={{
                hiddenColumns: hiddenColumns,
                pageSize: appConfig.query.defaultPageSize
            }}
            title={t('Columns')}
            version={version}
            onRequest={handleRequest}
        />
    )
}