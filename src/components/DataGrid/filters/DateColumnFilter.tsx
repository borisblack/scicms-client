import React from 'react'
import {Input, message} from 'antd'
import {DateTime} from 'luxon'
import {DATE_FORMAT_STRING, DATETIME_FORMAT_STRING} from '../../../config/constants'
import {Column} from '@tanstack/react-table'

interface Props {
    column: Column<any, unknown>
}

export default function DateColumnFilter({column}: Props) {
    const columnFilterValue = column.getFilterValue() as any

    function handleClick(evt: any) {
        evt.stopPropagation()
    }

    function handleKeyUp(evt: any) {
        if (evt.keyCode === 13) {
            const {value} = evt.currentTarget
            if (!value) {
                column.setFilterValue(undefined)
            } else {
                let dt = DateTime.fromFormat(value, DATETIME_FORMAT_STRING) as any

                if (dt.invalid !== null)
                    dt = DateTime.fromFormat(value, DATE_FORMAT_STRING) as any

                if (dt.invalid === null)
                    column.setFilterValue(dt.toSQL({includeOffset: false}))
                else
                    message.warn('Date must be in format DD.MM.YYYY HH:MM')
            }
        }
    }

    function handleChange(evt: any) {
        column.setFilterValue(evt.target.value || undefined) // set undefined to remove the filter entirely
    }

    return (
        <Input
            disabled
            size="small"
            value={columnFilterValue || ''}
            onClick={handleClick}
            onKeyUp={handleKeyUp}
            onChange={handleChange}
        />
    )
}
