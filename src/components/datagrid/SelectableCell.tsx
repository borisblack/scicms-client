import {Select} from 'antd'
import {BaseSelectRef} from 'rc-select'
import {DefaultOptionType} from 'rc-select/lib/Select'
import {KeyboardEvent, useRef, useState} from 'react'

interface Props {
    value: any
    options: DefaultOptionType[]
    onChange: (value: any) => void
}

export default function SelectableCell({value, options, onChange}: Props) {
    const [editing, setEditing] = useState(false)
    const selectInput = useRef<BaseSelectRef>(null)

    function startEditing() {
        setEditing(true)
        setTimeout(() => selectInput.current?.focus(), 100)
    }

    function handleSelect(newValue: any) {
        onChange(newValue)
        setEditing(false)
    }

    function handleClear() {
        onChange(null)
        setEditing(false)
    }

    function handleKeyUp(evt: KeyboardEvent<HTMLDivElement>) {
        if (evt.key === 'Escape') {
            setEditing(false)
        }
    }

    return editing ? (
        <Select
            ref={selectInput}
            style={{minWidth: 120}}
            size="small"
            allowClear
            options={options}
            value={value}
            onSelect={handleSelect}
            onClear={handleClear}
            onKeyUp={handleKeyUp}
        />
    ) : (
        <div style={{minHeight: 22}} onDoubleClick={startEditing}>
            {value}
        </div>
    )
}