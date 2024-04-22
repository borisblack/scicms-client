import _ from 'lodash'
import {MouseEvent, ReactNode, useCallback, useEffect, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  Row,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {restrictToVerticalAxis} from '@dnd-kit/modifiers'
import {Col, MenuProps, Pagination, Row as AntdRow, Spin} from 'antd'
import {CaretDownFilled, CaretUpFilled} from '@ant-design/icons'

import ColumnFilter from './ColumnFilter'
import Toolbar from './Toolbar'
import {exportWinFeatures, exportWinStyle, renderValue} from 'src/util/export'
import {DraggableRow} from './DraggableRow'
import {RowDragHandleCell} from './RowDragHandleCell'
import styles from './DataGrid.module.css'
import './DataGrid.css'

interface DataGridProps<T> {
    loading?: boolean
    columns: ColumnDef<T>[]
    data: DataWithPagination<T>
    initialState: {
        hiddenColumns: string[]
        pageSize: number
    }
    hasFilters?: boolean
    version?: number
    toolbar?: ReactNode
    title?: string
    height?: number
    rowDndEnabled?: boolean
    getRowId: (originalRow: T, index: number, parent?: Row<T>) => string
    getRowContextMenu?: (row: Row<T>) => MenuProps['items']
    onRequest: (params: RequestParams) => void
    onRowDoubleClick?: (row: Row<any>) => void
    onRowMove?: (evt: DragEndEvent) => void
}

export interface DataWithPagination<T> {
    data: T[]
    pagination: {
        page: number
        pageSize: number
        total: number
    }
}

interface ColumnVisibility {
    [name: string]: boolean
}

export interface RequestParams {
    sorting: SortingState
    filters: ColumnFiltersState
    pagination: RequestPagination
}

interface RequestPagination {
    page?: number
    pageSize?: number
}

const COLUMN_RESIZE_MODE: ColumnResizeMode = 'onChange'
const HEADER_FOOTER_HEIGHT = 184
const DRAG_HANDLE_COLUMN_ID = 'drag-handle'

export function DataGrid<T>({
  loading = false,
  columns: propColumns,
  data,
  initialState,
  version = 0,
  toolbar = null,
  title = '',
  height,
  getRowId,
  getRowContextMenu,
  onRequest,
  onRowDoubleClick = () => {},
  onRowMove
}: DataGridProps<T>) {
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => {
    const initialColumnVisibility: ColumnVisibility = {DRAG_HANDLE_COLUMN_ID: !!onRowMove}
    initialState.hiddenColumns.forEach(it => {
      initialColumnVisibility[it] = false
    })

    return initialColumnVisibility
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const {t} = useTranslation()
  const columns: ColumnDef<T>[] = useMemo(() => {
    const isRowDndEnabled = !!onRowMove
    if (!isRowDndEnabled)
      return propColumns

    return [
      {
        id: DRAG_HANDLE_COLUMN_ID,
        header: '',
        cell: ({row}: any) => <RowDragHandleCell rowId={row.id}/>,
        size: 40
      },
      ...(propColumns.map(col => ({...col, enableSorting: false, enableColumnFilter: false})))
    ]
  }, [onRowMove, propColumns])
  const hasFilters = useMemo(() => columns.some(col => col.enableColumnFilter), [columns])

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data.data.map((row, i) => getRowId?.(row, i) ?? i),
    [data.data]
  )

  const table = useReactTable({
    columns,
    data: data.data,
    state: {
      columnVisibility,
      sorting,
      columnFilters,
      rowSelection
    },
    columnResizeMode: COLUMN_RESIZE_MODE,
    sortDescFirst: false,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection
  })

  const refresh = useCallback((pagination: RequestPagination, clearFilters: boolean = false) => {
    if (clearFilters)
      setColumnFilters([])

    onRequest({
      sorting,
      filters: clearFilters ? [] : columnFilters,
      pagination
    })
  }, [sorting, columnFilters, onRequest])

  useEffect(() => {
    const {page, pageSize} = data.pagination
    refresh({page, pageSize})
  }, [version, sorting])

  useEffect(() => setRowSelection({}), [data])

  const handleFilterSubmit = useCallback((columnId: string) => {
    const {page, pageSize} = data.pagination
    refresh({page, pageSize})
  }, [data.pagination, refresh])

  const handlePageChange = useCallback(
    (page: number, pageSize: number) => refresh({page, pageSize}),
    [refresh]
  )

  const handleShowSizeChange = useCallback(
    (current: number, size: number) => refresh({page: current, pageSize: size}),
    [refresh]
  )

  const handleRowSelection = useCallback((row: Row<any>, evt: MouseEvent<any>) => {
    const selectedIds = Object.keys(rowSelection)
    if (selectedIds.length === 0) {
      row.getToggleSelectedHandler()(evt)
    } else {
      if (evt.ctrlKey) {
        row.getToggleSelectedHandler()(evt)
      } else if (evt.shiftKey) {
        const curId = parseInt(row.id)
        const ids = selectedIds.map(it => parseInt(it))
        const minId = _.min(ids) ?? 0
        const newRowSelection: {[id: string]: boolean} = {}
        if (curId > minId) {
          for (let i = minId; i <= curId; i++) {
            newRowSelection[i] = true
          }
          table.setRowSelection(newRowSelection)
        } else if (curId < minId) {
          for (let i = curId; i <= minId; i++) {
            newRowSelection[i] = true
          }
          table.setRowSelection(newRowSelection)
        }
      } else {
        table.setRowSelection({[row.id]: true})
      }
    }
  }, [table, rowSelection])

  const renderHtmlTableRow = useCallback((visibleColumns: string[], row: any): string => {
    return `<tr>${visibleColumns.map(key => `<td>${renderValue(row[key])}</td>`).join('')}</tr>`
  }, [])

  function handleDragEnd(evt: DragEndEvent) {
    onRowMove?.(evt)
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const handleHtmlExport = useCallback(() => {
    const visibleColumns = columns.filter((col: any) => columnVisibility[col.accessorKey] !== false)
    const exportWinHtml = `<!DOCTYPE html>
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        ${exportWinStyle}
                    </style>
                </head>
                <body>
                    <h2>${title}</h2>
                    <table>
                        <thead>
                            <tr>
                                ${visibleColumns.map(col => `<th>${col.header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.data.map(row => renderHtmlTableRow(visibleColumns.map((col: any) => col.accessorKey), row)).join('')}
                        </tbody>
                    </table>
                </body>
            </html>`

    // const exportWinUrl = URL.createObjectURL(new Blob([exportWinHtml], { type: "text/html" }))
    const exportWin = window.open('', 'Export HTML', exportWinFeatures) as Window
    exportWin.document.body.innerHTML = exportWinHtml
  }, [columnVisibility, columns, data.data, renderHtmlTableRow, title])

  return (
    <Spin spinning={loading}>
      <AntdRow>
        <Col span={12}>
          {toolbar}
        </Col>
        <Col span={12} style={{textAlign: 'right'}}>
          <Toolbar
            table={table}
            hasFilters={hasFilters}
            onRefresh={() => {
              const {page, pageSize} = data.pagination
              refresh({page, pageSize})
            }}
            onClearFilters={() => {
              const {page, pageSize} = data.pagination
              refresh({page, pageSize}, true)
            }}
            onHtmlExport={handleHtmlExport}
          />
        </Col>
      </AntdRow>

      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className={styles.tableWrapper}>
          <div className={styles.tableSmall}>
            <div className={styles.tableContainer}>
              <div className={styles.tableContent}>
                <table style={{width: table.getCenterTotalSize()}}>
                  <thead className={`ant-table-thead ${styles.thead}`}>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id} className={styles.tr}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className={`${header.column.getCanSort() ? styles.tableColumnHasSorters : ''} ${hasFilters ? styles.hasFilter : ''}`}
                            style={{width: header.getSize()}}
                          >
                            <div className={styles.tableColumnSorters} onClick={header.column.getToggleSortingHandler()}>
                              <span className={styles.tableColumnTitle}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                              </span>
                              {header.column.getCanSort() && (
                                <span className={styles.tableColumnSorter}>
                                  <span className={styles.tableColumnSorterInner}>
                                    <CaretUpFilled className={`${styles.tableColumnSorterUp} ${header.column.getIsSorted() === 'asc' ? styles.active : ''}`}/>
                                    <CaretDownFilled className={`${styles.tableColumnSorterDown} ${header.column.getIsSorted() === 'desc' ? styles.active : ''}`}/>
                                  </span>
                                </span>
                              )}
                            </div>
                            {hasFilters && header.column.getCanFilter() ? <ColumnFilter column={header.column} onSubmit={() => handleFilterSubmit(header.id)}/> : null}
                            <div
                              className={`${styles.resizer} ${header.column.getIsResizing() ? styles.isResizing : ''}`}
                              style={{transform: COLUMN_RESIZE_MODE === 'onEnd' && header.column.getIsResizing() ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)` : ''}}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                            />
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  <tbody className={styles.tbody} style={{height: height ? (height - HEADER_FOOTER_HEIGHT) : undefined}}>
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map(row => (
                        <DraggableRow
                          key={row.id}
                          row={row}
                          getRowContextMenu={getRowContextMenu}
                          onRowClick={handleRowSelection}
                          onRowDoubleClick={onRowDoubleClick}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DndContext>

      <div className={styles.pagination}>
        <Pagination
          current={data.pagination.page}
          defaultPageSize={initialState.pageSize}
          pageSize={data.pagination.pageSize}
          pageSizeOptions={['10', '20', '50', '100']}
          showSizeChanger
          showQuickJumper
          showTotal={total => `${t('Total records')}: ${total}`}
          size="small"
          total={data.pagination.total}
          onChange={handlePageChange}
          onShowSizeChange={handleShowSizeChange}
        />
      </div>
    </Spin>
  )
}
