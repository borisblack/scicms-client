import React from 'react'
import {Input} from 'antd'

interface Props {
    column: any
}

function DefaultColumnFilter({column}: Props) {
    const {Header, filterValue, setFilter} = column

    function handleClick(evt: any) {
        evt.stopPropagation()
    }

    function handleKeyUp(evt: any) {
        if (evt.keyCode === 13)
            setFilter(evt.currentTarget.value || undefined) // set undefined to remove the filter entirely
    }

    function handleChange(evt: any) {
        setFilter(evt.target.value || undefined) // set undefined to remove the filter entirely
    }

    return (
        <Input
            // value={filterValue || ''}
            // placeholder={Header}
            onClick={handleClick}
            onKeyUp={handleKeyUp}
            // onChange={handleChange}
        />
    )
}

export default DefaultColumnFilter