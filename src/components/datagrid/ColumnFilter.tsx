import {ChangeEvent, KeyboardEvent, MouseEvent} from 'react'
import {Column} from '@tanstack/react-table'
import {Input} from 'antd'
import styles from './DataGrid.module.css'

interface Props {
    column: Column<any, unknown>
    onSubmit: () => void
}

export default function ColumnFilter({column, onSubmit}: Props) {
    const columnFilterValue = column.getFilterValue() as any

    function handleClick(evt: MouseEvent) {
        evt.stopPropagation()
    }

    function handleKeyDown(evt: KeyboardEvent<any>) {
        evt.stopPropagation()
    }

    function handleKeyUp(evt: KeyboardEvent<any>) {
        evt.stopPropagation()
        if (evt.key === 'Enter')
            onSubmit()
    }

    function handleChange(evt: ChangeEvent<any>) {
        column.setFilterValue(evt.target.value ?? undefined) // set undefined to remove the filter entirely
    }

    return (
        <div className={styles.tableColumnFilter}>
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