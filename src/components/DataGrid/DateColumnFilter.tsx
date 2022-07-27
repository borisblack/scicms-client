import React from 'react'
import {Input, message} from 'antd'
import {DateTime} from 'luxon'
import {DATE_FORMAT_STRING, DATETIME_FORMAT_STRING} from '../../config/constants'

interface Props {
    column: any
}

function DateColumnFilter({column}: Props) {
    const {Header, filterValue, setFilter} = column

    function handleClick(evt: any) {
        evt.stopPropagation()
    }

    function handleKeyUp(evt: any) {
        if (evt.keyCode === 13) {
            const {value} = evt.currentTarget
            if (!value) {
                setFilter(undefined)
            } else {
                let dt = DateTime.fromFormat(value, DATETIME_FORMAT_STRING) as any

                if (dt.invalid !== null)
                    dt = DateTime.fromFormat(value, DATE_FORMAT_STRING) as any

                if (dt.invalid === null)
                    setFilter(dt.toSQL({includeOffset: false}))
                else
                    message.warn('Необходимо ввести дату в формате DD.MM.YYYY HH:MM')
            }
        }
    }

    function handleChange(evt: any) {
        setFilter(evt.target.value || undefined) // set undefined to remove the filter entirely
    }

    return (
        <Input
            disabled
            // value={filterValue || ''}
            // placeholder={Header}
            onClick={handleClick}
            onKeyUp={handleKeyUp}
            // onChange={handleChange}
        />
    )
}

export default DateColumnFilter