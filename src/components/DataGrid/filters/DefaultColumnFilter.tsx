import React from 'react'
import {Input} from 'antd'
import {Column} from '@tanstack/react-table'

interface Props {
    column: Column<any, unknown>
}

function DefaultColumnFilter({column}: Props) {
    const columnFilterValue = column.getFilterValue() as any

    function handleClick(evt: any) {
        evt.stopPropagation()
    }

    function handleKeyUp(evt: any) {
        if (evt.keyCode === 13)
            column.setFilterValue(evt.currentTarget.value || undefined) // set undefined to remove the filter entirely
    }

    function handleChange(evt: any) {
        column.setFilterValue(evt.target.value || undefined) // set undefined to remove the filter entirely
    }

    return (
        <Input
            size="small"
            value={columnFilterValue || ''}
            onClick={handleClick}
            onKeyUp={handleKeyUp}
            onChange={handleChange}
        />
    )
}

export default DefaultColumnFilter