import {useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {CustomComponentRenderContext} from '../../index'
import {DATASET_ITEM_NAME} from '../../../config/constants'
import DataGrid, {DataWithPagination, RequestParams} from '../../../components/datagrid/DataGrid'
import appConfig from '../../../config'
import {getInitialData, NamedColumn, processLocal} from '../../../util/datagrid'
import {DatasetSpec, FieldType} from '../../../types'
import {ColumnDef, createColumnHelper} from '@tanstack/react-table'
import i18n from '../../../i18n'
import {Tag} from 'antd'
import EditableCell from '../../../components/datagrid/EditableCell'

const columnHelper = createColumnHelper<NamedColumn>()
const getGridColumns = (onChange: (vale: NamedColumn) => void): ColumnDef<NamedColumn, any>[] => [
    columnHelper.accessor('name', {
        header: i18n.t('Name'),
        cell: info => info.getValue(),
        size: appConfig.ui.dataGrid.colWidth,
        enableSorting: true
    }) as ColumnDef<NamedColumn, string>,
    columnHelper.accessor('type', {
        header: i18n.t('Type'),
        cell: info => <Tag color="processing">{info.getValue()}</Tag>,
        size: appConfig.ui.dataGrid.colWidth,
        enableSorting: true
    }) as ColumnDef<NamedColumn, FieldType>,
    columnHelper.accessor('alias', {
        header: i18n.t('Alias'),
        cell: info => <EditableCell value={info.getValue()} onChange={alias => onChange({...info.row.original, alias})}/>,
        size: 250,
        enableSorting: true
    }) as ColumnDef<NamedColumn, FieldType>
]

export default function Columns({item, buffer, data}: CustomComponentRenderContext) {
    if (item.name !== DATASET_ITEM_NAME)
        throw new Error('Illegal attribute')

    const {t} = useTranslation()
    const spec: DatasetSpec = useMemo(() => buffer.spec ?? data?.spec ?? {}, [buffer.spec, data?.spec])
    const [version, setVersion] = useState<number>(0)
    const namedColumns = useMemo((): NamedColumn[] => {
        const columns = spec.columns ?? {}
        return Object.keys(columns).map(colName => ({name: colName, ...columns[colName]}))
    }, [spec.columns])
    const [filteredData, setFilteredData] = useState<DataWithPagination<NamedColumn>>(getInitialData())
    const gridColumns = useMemo(() => getGridColumns(() => {}), [])

    useEffect(() => {
        setVersion(prevVersion => prevVersion + 1)
    }, [data?.spec])

    const handleRequest = useCallback(async (params: RequestParams) => {
        setFilteredData(processLocal(namedColumns, params))
    }, [namedColumns])

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