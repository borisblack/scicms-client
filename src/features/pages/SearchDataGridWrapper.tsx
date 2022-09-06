import {useCallback, useMemo, useRef, useState} from 'react'
import {Row} from '@tanstack/react-table'
import {Checkbox, message} from 'antd'

import appConfig from '../../config'
import DataGrid, {RequestParams} from '../../components/datagrid/DataGrid'
import {findAll, getColumns, getHiddenColumns, getInitialData} from '../../util/datagrid'
import {Item, ItemData} from '../../types'
import {ExtRequestParams, FiltersInput} from '../../services/query'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import {useTranslation} from 'react-i18next'

interface Props {
    item: Item
    notHiddenColumns?: string[]
    extraFiltersInput?: FiltersInput<ItemData>
    majorRev?: string | null
    locale?: string | null
    state?: string | null
    onSelect: (itemData: ItemData) => void
}

export default function SearchDataGridWrapper({item, notHiddenColumns = [], extraFiltersInput, majorRev, locale, state, onSelect}: Props) {
    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState(getInitialData())
    const [version, setVersion] = useState<number>(0)
    const showAllLocalesRef = useRef<boolean>(false)

    const notHiddenColumnSet = useMemo(() => new Set(notHiddenColumns), [notHiddenColumns])
    const columnsMemoized = useMemo(() => getColumns(item), [item])
    const hiddenColumnsMemoized = useMemo(() => getHiddenColumns(item).filter(it => !notHiddenColumnSet.has(it)), [item, notHiddenColumnSet])

    const handleRequest = useCallback(async (params: RequestParams) => {
        const allParams: ExtRequestParams = {...params, majorRev, locale: showAllLocalesRef.current ? 'all' : locale, state}

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

    function handleLocalizationsCheckBoxChange(e: CheckboxChangeEvent) {
        showAllLocalesRef.current = e.target.checked
        setVersion(prevVersion => prevVersion + 1)
    }

    const handleRowDoubleClick = (row: Row<ItemData>) => onSelect(row.original)

    return (
        <>
            <DataGrid
                loading={loading}
                columns={columnsMemoized}
                data={data}
                version={version}
                initialState={{
                    hiddenColumns: hiddenColumnsMemoized,
                    pageSize: appConfig.query.findAll.defaultPageSize
                }}
                toolbar={item.localized && <Checkbox onChange={handleLocalizationsCheckBoxChange}>{t('All Locales')}</Checkbox>}
                onRequest={handleRequest}
                onRowDoubleClick={handleRowDoubleClick}
            />
        </>
    )
}