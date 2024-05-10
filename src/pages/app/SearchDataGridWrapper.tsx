import {useCallback, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Row} from '@tanstack/react-table'
import {Checkbox, notification} from 'antd'

import appConfig from 'src/config'
import {RequestParams, DataGrid} from 'src/uiKit/DataGrid'
import {findAll, getColumns, getHiddenColumns, getInitialData} from 'src/util/datagrid'
import {Item, ItemData} from 'src/types/schema'
import {ExtRequestParams, ItemFiltersInput} from 'src/services/query'
import {CheckboxChangeEvent} from 'antd/es/checkbox'
import {useItemOperations, useRegistry} from 'src/util/hooks'

interface Props {
    item: Item
    notHiddenColumns?: string[]
    extraFiltersInput?: ItemFiltersInput<ItemData>
    majorRev?: string | null
    locale?: string | null
    state?: string | null
    onSelect: (itemData: ItemData) => void
}

export default function SearchDataGridWrapper({item, notHiddenColumns = [], extraFiltersInput, majorRev, locale, state, onSelect}: Props) {
  const {items: itemMap} = useRegistry()
  const {open: openItem} = useItemOperations()
  const {t} = useTranslation()
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState(getInitialData<ItemData>())
  const [version, setVersion] = useState<number>(0)
  const showAllLocalesRef = useRef<boolean>(false)

  const notHiddenColumnSet = useMemo(() => new Set(notHiddenColumns), [notHiddenColumns])
  const columnsMemoized = useMemo(() => getColumns(itemMap, item, openItem), [item, itemMap])
  const hiddenColumnsMemoized = useMemo(() => getHiddenColumns(item).filter(it => !notHiddenColumnSet.has(it)), [item, notHiddenColumnSet])

  const handleRequest = useCallback(async (params: RequestParams) => {
    const allParams: ExtRequestParams = {...params, majorRev, locale: showAllLocalesRef.current ? 'all' : locale, state}

    try {
      setLoading(true)
      const dataWithPagination = await findAll(itemMap, item, allParams, extraFiltersInput)
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
  }, [majorRev, locale, state, itemMap, item, extraFiltersInput])

  const handleLocalizationsCheckBoxChange = useCallback((e: CheckboxChangeEvent) => {
    showAllLocalesRef.current = e.target.checked
    setVersion(prevVersion => prevVersion + 1)
  }, [])

  const handleRowDoubleClick = useCallback((row: Row<ItemData>) => onSelect(row.original), [onSelect])

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
      toolbar={item.localized && <Checkbox onChange={handleLocalizationsCheckBoxChange}>{t('All Locales')}</Checkbox>}
      title={t(item.displayPluralName)}
      getRowId={originalRow => originalRow.id}
      onRequest={handleRequest}
      onRowDoubleClick={handleRowDoubleClick}
    />
  )
}