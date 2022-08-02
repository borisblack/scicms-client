import {ReactElement, useCallback, useEffect, useMemo, useState} from 'react'
import {ColumnFiltersState, flexRender, getCoreRowModel, SortingState, useReactTable} from '@tanstack/react-table'
import {Dropdown, Pagination, Spin} from 'antd'
import {CaretDownFilled, CaretUpFilled} from '@ant-design/icons'

import styles from './DataGrid.module.css'
import './DataGrid.css'
import ColumnFilter from './ColumnFilter'
import Toolbar from './Toolbar'
import {useTranslation} from 'react-i18next'

interface Props {
    loading: boolean
    columns: any[]
    data: DataWithPagination<any>
    initialState: {
        hiddenColumns: string[]
        pageSize: number
    }
    getRowContextMenu: (row: any) => ReactElement
    onRequest: (params: RequestParams) => void
    onRowDoubleClick: (row: any) => void
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
    pagination: {
        page: number,
        pageSize: number
    }
}

function DataGrid({loading, columns, data, initialState, getRowContextMenu, onRequest, onRowDoubleClick}: Props) {
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
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
    const {t} = useTranslation()

    const table = useReactTable({
        columns,
        data: data.data,
        state: {
            columnVisibility,
            sorting,
            columnFilters
        },
        columnResizeMode: 'onEnd',
        sortDescFirst: false,
        getCoreRowModel: getCoreRowModel(),
        // getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
    })

    useEffect(() => {
        const {page, pageSize} = data.pagination
        onRequest({
            sorting,
            filters: columnFilters,
            pagination: {page, pageSize}
        })
    }, [sorting, onRequest])

    const handleFilterSubmit = useCallback((columnId: string) => {
        const {page, pageSize} = data.pagination
        onRequest({
            sorting,
            filters: columnFilters,
            pagination: {page, pageSize}
        })
    }, [data.pagination, sorting, columnFilters, onRequest])

    const handlePageChange = useCallback((page: number, pageSize: number) => {
        onRequest({
            sorting,
            filters: columnFilters,
            pagination: {page, pageSize}
        })
    }, [sorting, columnFilters, onRequest])

    const handleShowSizeChange = useCallback((current: number, size: number) => onRequest({
        sorting,
        filters: columnFilters,
        pagination: {
            page: current,
            pageSize: size
        }
        }), [sorting, columnFilters, onRequest])

    return (
        <Spin spinning={loading}>
            <div className={styles.toolbar}>
                <Toolbar table={table}/>
            </div>

            <div className="ant-table-wrapper">
                <div className="ant-table ant-table-small">
                    <div className="ant-table-container">
                        <div className={`ant-table-content ${styles.antTableContent}`}>
                            <table style={{/*tableLayout: 'auto',*/ width: table.getCenterTotalSize()}}>
                                <thead className="ant-table-thead">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id} className={styles.tr}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className={`ant-table-cell ${header.column.getCanSort() ? 'ant-table-column-has-sorters' : ''}`}
                                                style={{width: header.getSize()}}
                                            >
                                                <div>
                                                    <div className="ant-table-column-sorters" onClick={header.column.getToggleSortingHandler()}>
                                                        <span className={`ant-table-column-title ${styles.antTableColumnTitle}`}>
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
                                                    {header.column.getCanFilter() ? <ColumnFilter column={header.column} onSubmit={() => handleFilterSubmit(header.id)}/> : null}
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
                                {table.getRowModel().rows.map(row => (
                                    <Dropdown key={row.id} overlay={getRowContextMenu(row)} trigger={['contextMenu']}>
                                        <tr
                                            className={`${styles.tr} ${row.getValue('id') === selectedRowId ? styles.selected : ''}`}
                                            onClick={() => setSelectedRowId(row.getValue('id'))}
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
                                    </Dropdown>
                                ))}
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