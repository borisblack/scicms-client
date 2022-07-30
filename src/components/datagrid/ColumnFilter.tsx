import React from 'react'
import {Column} from '@tanstack/react-table'
import {Input} from 'antd'
import styles from './DataGrid.module.css'

interface Props {
    column: Column<any, unknown>
    onSubmit: () => void
}

export default function ColumnFilter({column, onSubmit}: Props) {
    const columnFilterValue = column.getFilterValue() as any

    function handleClick(evt: React.MouseEvent) {
        evt.stopPropagation()
    }

    function handleKeyDown(evt: React.KeyboardEvent<any>) {
        evt.stopPropagation()
    }

    function handleKeyUp(evt: React.KeyboardEvent<any>) {
        evt.stopPropagation()
        if (evt.key === 'Enter' && evt.target.value)
            onSubmit()
    }

    function handleChange(evt: React.ChangeEvent<any>) {
        column.setFilterValue(evt.target.value ?? undefined) // set undefined to remove the filter entirely
    }

    return (
        <div className={styles.columnFilter}>
            <Input
                size="small"
                value={columnFilterValue ?? ''}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onClick={handleClick}
                onChange={handleChange}
            />
        </div>
    )
}