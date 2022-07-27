import React, {ReactElement} from 'react'
import {flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {Dropdown, Spin} from 'antd'
import styles from './DataGrid.module.css'
import './DataGrid.css'

interface Props {
    loading: boolean
    columns: any[]
    data: any[]
    pageSize: number
    total: number
    initialState: any
    getRowContextMenu: (row: any) => ReactElement
    onFetchData: (params: FetchParams) => void
    onRowDoubleClick: (row: any) => void
}

export interface FetchParams {
    page: number
    pageSize: number
    sortBy: {id: string, desc: boolean}[]
    filters: {id: string, value: string}[]
}

function DataGrid({loading, columns, data, pageSize: controlledPageSize, total, initialState, onFetchData, getRowContextMenu, onRowDoubleClick}: Props) {
    // const defaultColumn = React.useMemo(() => ({
    //     width: 120
    // }), [])

    const table = useReactTable({
            columns,
            data,
            getCoreRowModel: getCoreRowModel()
        }
    )

    // useEffect(() => {
    //     onFetchData({pageIndex, pageSize, sortBy, filters})
    // }, [])

    return (
        <Spin spinning={loading}>
            {/*<div className={styles.toolbar}>*/}
            {/*    <Toolbar allColumns={allColumns}/>*/}
            {/*</div>*/}

            <div className="ant-table-wrapper">
                <div className="ant-table ant-table-small">
                    <div className="ant-table-container">
                        <div className={`ant-table-content ${styles.antTableContent}`}>
                            <table>
                                <thead className="ant-table-thead">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className="ant-table-cell ant-table-column-sort ant-table-column-has-sorters"
                                            >
                                                <div className="ant-table-filter-column">
                                                    <span className="ant-table-filter-column-title">
                                                        <div className="ant-table-column-sorters-with-tooltip">
                                                            <div className="ant-table-column-sorters">
                                                                <span className={styles.header}>
                                                                    {header.isPlaceholder ? null : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                                </span>
                                                                {/*<span className="ant-table-column-sorter ant-table-column-sorter-full">*/}
                                                                {/*    <span className="ant-table-column-sorter-inner">*/}
                                                                {/*        <CaretUpFilled className={`ant-table-column-sorter-up ${header.isSortedDesc === false ? 'active' : ''}`}/>*/}
                                                                {/*        <CaretDownFilled className={`ant-table-column-sorter-down ${header.isSortedDesc === true ? 'active' : ''}`}/>*/}
                                                                {/*    </span>*/}
                                                                {/*</span>*/}
                                                            </div>
                                                        </div>
                                                    </span>
                                                </div>
                                                {/*<div>*/}
                                                {/*    {header.canFilter ? header.render('Filter') : null}*/}
                                                {/*</div>*/}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                                </thead>

                                <tbody className="ant-table-tbody data-grid">
                                {table.getRowModel().rows.map(row => {
                                    // prepareRow(row)
                                    return (
                                        <Dropdown overlay={getRowContextMenu(row)} trigger={['contextMenu']}>
                                            <tr
                                                // className="ant-table-row ant-table-row-level-0"
                                                onDoubleClick={() => onRowDoubleClick(row)}
                                            >
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="ant-table-cell">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        </Dropdown>
                                    )
                                })}
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