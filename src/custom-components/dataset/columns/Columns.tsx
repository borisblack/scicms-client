import {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {CustomComponentRenderContext} from '../../index'
import {DATASET_ITEM_NAME} from '../../../config/constants'
import {NamedAttribute, NamedColumn} from '../../../types'
import DataGrid, {DataWithPagination, RequestParams} from '../../../components/datagrid/DataGrid'
import appConfig from '../../../config'
import {getColumnColumns, getHiddenColumnColumns, getInitialData, processLocal} from '../../../util/datagrid'

export default function Columns({me, item, buffer, data}: CustomComponentRenderContext) {
    if (item.name !== DATASET_ITEM_NAME)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const [version, setVersion] = useState<number>(0)
    const columns = useMemo(() => getColumnColumns(), [])
    const hiddenColumns = useMemo(() => getHiddenColumnColumns(), [])
    const namedColumns = useMemo((): NamedColumn[] => {
        const columns = data?.spec?.columns ?? {}
        return Object.keys(columns).map(attrName => ({name: attrName, ...columns[attrName]}))
    }, [data?.spec?.columns])
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedAttribute>>(getInitialData())

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