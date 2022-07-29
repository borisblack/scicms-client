import React from 'react'
import {Input, message} from 'antd'
import {DateTime} from 'luxon'
import {DATE_FORMAT_STRING, DATETIME_FORMAT_STRING} from '../../../../config/constants'

interface Props {
    value: any,
    onChange: (value: any) => void
    onSubmit: () => void
}

export default function DateColumnFilter({value, onChange, onSubmit}: Props) {
    function handleClick(evt: any) {
        evt.stopPropagation()
    }

    function handleKeyDown(evt: React.KeyboardEvent<any>) {
        evt.stopPropagation()
    }

    function handleKeyUp(evt: React.KeyboardEvent<any>) {
        evt.stopPropagation()
        if (evt.key === 'Enter')
            onSubmit()
    }

    function handleChange(evt: React.ChangeEvent<any>) {
        const {value} = evt.currentTarget
        if (!value) {
            onChange(undefined) // set undefined to remove the filter entirely
        } else {
            let dt = DateTime.fromFormat(value, DATETIME_FORMAT_STRING) as any

            if (dt.invalid !== null)
                dt = DateTime.fromFormat(value, DATE_FORMAT_STRING) as any

            if (dt.invalid === null)
                onChange(dt.toSQL({includeOffset: false}))
            else
                message.warn('Date must be in format DD.MM.YYYY HH:MM')
        }
    }

    return (
        <Input
            disabled
            size="small"
            value={value ?? ''}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onClick={handleClick}
            onChange={handleChange}
        />
    )
}
