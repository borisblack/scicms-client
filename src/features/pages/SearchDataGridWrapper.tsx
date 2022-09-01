import {useCallback, useMemo, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {message} from 'antd'

import appConfig from '../../config'
import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'
import {findAll, getColumns, getHiddenColumns, getInitialData} from '../../util/datagrid'
import {Item, ItemData} from '../../types'
import {FiltersInput} from '../../services/query'

interface Props {
    item: Item
    extraFiltersInput?: FiltersInput<unknown>
    majorRev?: string
    locale?: string
    state?: string
    onSelect: (itemData: ItemData) => void
}

export default function SearchDataGridWrapper({item, extraFiltersInput, majorRev, locale, state, onSelect}: Props) {
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState(getInitialData())

    const columnsMemoized = useMemo(() => getColumns(item), [item])
    const hiddenColumnsMemoized = useMemo(() => getHiddenColumns(item), [item])

    const handleRequest = useCallback(async (params: RequestParams) => {
        const allParams: RequestParams = {...params, majorRev, locale, state}

        try {
            setLoading(true)
            const dataWithPagination = await findAll(item, allParams, extraFiltersInput)
            setData(dataWithPagination)
        } catch (e: any) {
            message.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [item, majorRev, locale, state, extraFiltersInput])

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