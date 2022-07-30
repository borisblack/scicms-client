import React, {ReactElement} from 'react'
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable
} from '@tanstack/react-table'
import {Dropdown, Spin} from 'antd'
import {CaretDownFilled, CaretUpFilled} from '@ant-design/icons'

import styles from './DataGrid.module.css'
import './DataGrid.css'
import ColumnFilter from './ColumnFilter'
import Toolbar from './Toolbar'

interface Props {
    loading: boolean
    columns: any[]
    data: any[]
    initialState: {
        hiddenColumns: string[]
    }
    getRowContextMenu: (row: any) => ReactElement
    onRequest: (params: RequestParams) => void
    onRowDoubleClick: (row: any) => void
}

interface ColumnVisibility {
    [name: string]: boolean
}

export interface RequestParams {
    sorting: SortingState
    filters: ColumnFiltersState
}

function DataGrid({loading, columns, data, initialState, getRowContextMenu, onRequest, onRowDoubleClick}: Props) {
    const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibility>(getInitialColumnVisibility())
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    function getInitialColumnVisibility(): ColumnVisibility {
        const initialColumnVisibility: ColumnVisibility = {}
        initialState.hiddenColumns.forEach(it => {
            initialColumnVisibility[it] = false
        })

        return initialColumnVisibility
    }

    const table = useReactTable({
        columns,
        data,
        state: {
            columnVisibility,
            sorting,
            columnFilters
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        sortDescFirst: false,
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters
    })

    const handleFilterSubmit = (columnId: string) => onRequest({sorting, filters: columnFilters})

    return (
        <Spin spinning={loading}>
            <div className={styles.toolbar}>
                <Toolbar table={table}/>
            </div>

            <div className="ant-table-wrapper">
                <div className="ant-table ant-table-small">
                    <div className="ant-table-container">
                        <div className={`ant-table-content ${styles.antTableContent}`}>
                            <table style={{tableLayout: 'auto'}}>
                                <thead className="ant-table-thead">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className={`ant-table-cell ${header.column.getCanSort() ? 'ant-table-column-has-sorters' : ''}`}
                                                style={{maxWidth: header.getSize()}}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div className="ant-table-column-sorters">
                                                    <span className={`ant-table-column-title ${styles.antTableColumnTitle}`}>
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </span>
                                                    <span className="ant-table-column-sorter ant-table-column-sorter-full">
                                                        <span className="ant-table-column-sorter-inner">
                                                            <CaretUpFilled className={`ant-table-column-sorter-up ${header.column.getIsSorted() === 'asc' ? 'active' : ''}`}/>
                                                            <CaretDownFilled className={`ant-table-column-sorter-down ${header.column.getIsSorted() === 'desc' ? 'active' : ''}`}/>
                                                        </span>
                                                    </span>
                                                </div>
                                                {header.column.getCanFilter() ? <ColumnFilter column={header.column} onSubmit={() => handleFilterSubmit(header.id)}/> : null}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                                </thead>

                                <tbody className="ant-table-tbody data-grid">
                                {table.getRowModel().rows.map(row => (
                                        <Dropdown key={row.id} overlay={getRowContextMenu(row)} trigger={['contextMenu']}>
                                            <tr onDoubleClick={() => onRowDoubleClick(row)}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="ant-table-cell" style={{maxWidth: cell.column.getSize()}}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        </Dropdown>
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/*<div className={styles.pagination}>*/}
            {/*    <Pagination*/}
            {/*        current={pageIndex + 1}*/}
            {/*        defaultPageSize={initialState.pageSize}*/}
            {/*        pageSize={controlledPageSize}*/}
            {/*        pageSizeOptions={['10', '20', '50', '100']}*/}
            {/*        showSizeChanger*/}
            {/*        showQuickJumper*/}
            {/*        showTotal={total => `Всего записей: ${total}`}*/}
            {/*        size="small"*/}
            {/*        total={total}*/}
            {/*        onChange={(page, pageSize) => {*/}
            {/*            gotoPage(page - 1)*/}
            {/*        }}*/}
            {/*        onShowSizeChange={(current, size) => {*/}
            {/*            setPageSize(size)*/}
            {/*        }}*/}
            {/*    />*/}
            {/*</div>*/}
        </Spin>
    )
}

export default DataGrid