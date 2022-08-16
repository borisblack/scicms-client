import appConfig from '../../../config'
import DataGrid, {RequestParams} from '../../../components/datagrid/DataGrid'
import {useCallback, useMemo, useState} from 'react'
import {findAll, getColumns, getHiddenColumns, getInitialData} from '../../../util/datagrid'
import {Item, ItemData} from '../../../types'
import {Row} from '@tanstack/react-table'
import {message} from 'antd'
import {FiltersInput} from '../../../services/query'

interface Props {
    item: Item
    extraFiltersInput?: FiltersInput<any>
    onSelect: (itemData: ItemData) => void
}

export default function SearchDataGridWrapper({item, extraFiltersInput, onSelect}: Props) {
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState(getInitialData())

    const columnsMemoized = useMemo(() => getColumns(item), [item])
    const hiddenColumnsMemoized = useMemo(() => getHiddenColumns(item), [item])

    const handleRequest = useCallback(async (params: RequestParams) => {
        try {
            setLoading(true)
            const dataWithPagination = await findAll(item, params, extraFiltersInput)
            setData(dataWithPagination)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [item])

    const handleRowDoubleClick = (row: Row<ItemData>) => onSelect(row.original)

    return (
        <DataGrid
            loading={loading}
            columns={columnsMemoized}
            data={data}
            initialState={{
                hiddenColumns: hiddenColumnsMemoized,
                pageSize: appConfig.query.findAll.defaultPageSize
            }}
            onRequest={handleRequest}
            onRowDoubleClick={handleRowDoubleClick}
        />
    )
}