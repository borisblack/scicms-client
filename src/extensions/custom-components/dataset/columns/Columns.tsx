import {useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {CustomComponentRenderContext} from 'src/extensions/custom-components'
import {DATASET_ITEM_NAME} from 'src/config/constants'
import DataGrid, {DataWithPagination, RequestParams} from 'src/components/datagrid/DataGrid'
import appConfig from 'src/config'
import {getInitialData, processLocal} from 'src/util/datagrid'
import {Column, DatasetSpec} from 'src/types/bi'
import {NamedColumn} from './types'
import {getColumns} from './columns-datagrid'
import {useAcl} from 'src/util/hooks'

export default function Columns({data: dataWrapper, buffer, onBufferChange}: CustomComponentRenderContext) {
    const {item, data} = dataWrapper
    if (item.name !== DATASET_ITEM_NAME)
        throw new Error('Illegal argument')

    const {t} = useTranslation()
    const acl = useAcl(item, data)
    const spec: DatasetSpec = useMemo(() => buffer.spec ?? data?.spec ?? {}, [buffer, data])
    const [namedColumns, setNamedColumns] = useState(getCurrentNamedColumns())
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedColumn>>(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const isNew = !data?.id

    useEffect(() => {
        setNamedColumns(getCurrentNamedColumns())
        onBufferChange({
            spec: data?.spec ?? {}
        })
    }, [data])

    useEffect(() => {
        setVersion(prevVersion => prevVersion + 1)
    }, [namedColumns])

    if (isNew)
        return null

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