import React from 'react'
import {Input} from 'antd'

interface Props {
    value: any,
    onChange: (value: any) => void
    onSubmit: () => void
}

function DefaultColumnFilter({value, onChange, onSubmit}: Props) {
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
        onChange(evt.target.value ?? undefined) // set undefined to remove the filter entirely
    }

    return (
        <Input
            size="small"
            value={value ?? ''}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onClick={handleClick}
            onChange={handleChange}
        />
    )
}

export default DefaultColumnFilter