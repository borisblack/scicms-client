import {useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {CustomComponentRenderContext} from '../../index'
import {DATASET_ITEM_NAME} from '../../../../config/constants'
import DataGrid, {DataWithPagination, RequestParams} from '../../../../components/datagrid/DataGrid'
import appConfig from '../../../../config'
import {getInitialData, processLocal} from '../../../../util/datagrid'
import {Column, DatasetSpec, NamedColumn} from '../../../../types'
import {getColumns} from './columns-datagrid'
import {useAcl} from '../../../../util/hooks'

export default function Columns({item, buffer, data, onBufferChange}: CustomComponentRenderContext) {
    if (item.name !== DATASET_ITEM_NAME)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const acl = useAcl(item, data)
    const spec: DatasetSpec = useMemo(() => data?.spec ?? buffer.spec ?? {}, [buffer.spec, data?.spec])
    const [namedColumns, setNamedColumns] = useState(getCurrentNamedColumns())
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedColumn>>(getInitialData())
    const [version, setVersion] = useState<number>(0)

    useEffect(() => {
        setNamedColumns(getCurrentNamedColumns())
        onBufferChange({
            spec
        })
    }, [spec])

    useEffect(() => {
        setVersion(prevVersion => prevVersion + 1)
    }, [namedColumns])

    function getCurrentNamedColumns(): NamedColumn[] {
        const columns = spec.columns ?? {}
        return Object.keys(columns).map(colName => ({name: colName, ...columns[colName]}))
    }

    function handleNamedColumnChange(namedCol: NamedColumn) {
        if (!acl.canWrite)
            return

        const newNamedColumns = namedColumns.map(nc => nc.name === namedCol.name ? {...namedCol} : nc)
        setNamedColumns(newNamedColumns)

        const newColumns: {[name: string]: Column} = {}
        for (const nc of newNamedColumns) {
            const newColumn: any = {...nc}
            newColumns[nc.name] = newColumn
            delete newColumn.name
        }

        onBufferChange({
            spec: {
                columns: newColumns
            }
        })
    }

    const handleRequest = (params: RequestParams) => {
        setFilteredData(processLocal(namedColumns, params))
    }

    const gridColumns = getColumns(acl.canWrite, handleNamedColumnChange)

    return (
        <DataGrid
            columns={gridColumns}
            data={filteredData}
            initialState={{
                hiddenColumns: [],
                pageSize: appConfig.query.defaultPageSize
            }}
            title={t('Columns')}
            version={version}
            onRequest={handleRequest}
        />
    )
}