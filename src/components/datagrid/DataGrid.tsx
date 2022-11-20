import _ from 'lodash'
import {MouseEvent, ReactElement, ReactNode, useCallback, useEffect, useMemo, useState} from 'react'
import {ColumnFiltersState, flexRender, getCoreRowModel, Row, SortingState, useReactTable} from '@tanstack/react-table'
import {Col, Dropdown, Pagination, Row as AntdRow, Spin} from 'antd'
import {CaretDownFilled, CaretUpFilled} from '@ant-design/icons'

import styles from './DataGrid.module.css'
import './DataGrid.css'
import ColumnFilter from './ColumnFilter'
import Toolbar from './Toolbar'
import {useTranslation} from 'react-i18next'
import {exportWinFeatures, exportWinStyle, renderValue} from '../../util/export'
import {ItemData} from '../../types'

interface Props {
    loading?: boolean
    columns: any[]
    data: DataWithPagination<any>
    initialState: {
        hiddenColumns: string[]
        pageSize: number
    }
    hasFilters?: boolean
    version?: number
    toolbar?: ReactNode
    title?: string
    getRowContextMenu?: (row: any) => ReactElement
    onRequest: (params: RequestParams) => void
    onRowDoubleClick: (row: Row<any>) => void
}

export interface DataWithPagination<T> {
    data: T[],
    pagination: {
        page: number,
        pageSize: number
        total: number
    }
}

interface ColumnVisibility {
    [name: string]: boolean
}

export interface RequestParams {
    sorting: SortingState,
    filters: ColumnFiltersState
    pagination: RequestPagination
}

interface RequestPagination {
    page: number,
    pageSize: number
}

function DataGrid({loading = false, columns, data, initialState, hasFilters = true, version = 0, toolbar = null, title = '', getRowContextMenu, onRequest, onRowDoubleClick}: Props) {
    const initialColumnVisibilityMemoized = useMemo((): ColumnVisibility => {
        const initialColumnVisibility: ColumnVisibility = {}
        initialState.hiddenColumns.forEach(it => {
            initialColumnVisibility[it] = false
        })

        return initialColumnVisibility
    }, [initialState.hiddenColumns])

    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(initialColumnVisibilityMemoized)
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState({})
    const {t} = useTranslation()

    const table = useReactTable({
        columns,
        data: data.data,
        state: {
            columnVisibility,
            sorting,
            columnFilters,
            rowSelection
        },
        columnResizeMode: 'onEnd',
        sortDescFirst: false,
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

    const renderHtmlTableRow = useCallback((row: ItemData): string =>
            `<tr>${Object.keys(row).filter(key => columnVisibility[key] !== false).map(key => `<td>${renderValue(row[key])}</td>`).join('')}</tr>`,
        [columnVisibility]
    )

    const handleHtmlExport = useCallback(() => {
        const visibleColumns = columns.filter(col => columnVisibility[col.accessorKey] !== false)
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
                            ${data.data.map(row => renderHtmlTableRow(row)).join('')}
                        </tbody>
                    </table>
                </body>
            </html>`

        // const exportWinUrl = URL.createObjectURL(new Blob([exportWinHtml], { type: "text/html" }))
        const exportWin = window.open('', 'Export HTML', exportWinFeatures) as Window
        exportWin.document.body.innerHTML = exportWinHtml
    }, [columnVisibility, columns, data.data, renderHtmlTableRow, t, title])

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

            <div className="ant-table-wrapper">
                <div className="ant-table ant-table-small">
                    <div className="ant-table-container">
                        <div className={`ant-table-content ${styles.tableContent}`}>
                            <table style={{width: table.getCenterTotalSize()}}>
                                <thead className={`ant-table-thead ${styles.thead}`}>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id} className={styles.tr}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className={`ant-table-cell ${header.column.getCanSort() ? 'ant-table-column-has-sorters' : ''} ${hasFilters ? 'has-filter' : ''}`}
                                                style={{width: header.getSize()}}
                                            >
                                                <div>
                                                    <div className="ant-table-column-sorters" onClick={header.column.getToggleSortingHandler()}>
                                                        <span className={`ant-table-column-title ${styles.tableColumnTitle}`}>
                                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                        </span>
                                                        {header.column.getCanSort() && (
                                                            <span className="ant-table-column-sorter ant-table-column-sorter-full">
                                                                <span className="ant-table-column-sorter-inner">
                                                                    <CaretUpFilled className={`ant-table-column-sorter-up ${header.column.getIsSorted() === 'asc' ? 'active' : ''}`}/>
                                                                    <CaretDownFilled className={`ant-table-column-sorter-down ${header.column.getIsSorted() === 'desc' ? 'active' : ''}`}/>
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    {hasFilters && header.column.getCanFilter() ? <ColumnFilter column={header.column} onSubmit={() => handleFilterSubmit(header.id)}/> : null}
                                                </div>
                                                <div
                                                    className={`${styles.resizer} ${header.column.getIsResizing() ? styles.isResizing : ''}`}
                                                    style={{transform: header.column.getIsResizing() ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)` : '',}}
                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                                </thead>

                                <tbody className={`ant-table-tbody data-grid ${styles.tbody}`}>
                                {table.getRowModel().rows.map(row => {
                                    const rowContent = (
                                        <tr
                                            key={row.id}
                                            className={`${styles.tr} ${row.getIsSelected() ? styles.selected : ''}`}
                                            onClick={evt => handleRowSelection(row, evt)}
                                            onDoubleClick={() => onRowDoubleClick(row)}
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <td
                                                    key={cell.id}
                                                    className="ant-table-cell"
                                                    style={{width: cell.column.getSize()}}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    )

                                    return getRowContextMenu ? (
                                        <Dropdown key={row.id} overlay={getRowContextMenu(row)} trigger={['contextMenu']}>
                                            {rowContent}
                                        </Dropdown>
                                    ) : rowContent
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

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

export default DataGrid