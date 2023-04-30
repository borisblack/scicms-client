import {InputNumber} from 'antd'
import {KeyboardEvent, useEffect, useRef, useState} from 'react'

interface Props {
    value: any
    onChange: (value: any) => void
}

export default function EditableNumberCell({value, onChange}: Props) {
    const [innerValue, setInnerValue] = useState(value)
    const [editing, setEditing] = useState(false)
    const editInput = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setInnerValue(value)
    }, [value])

    function startEditing() {
        setEditing(true)
        setTimeout(() => editInput.current?.select(), 100)
    }

    function handleChange(v: string | number | null) {
        setInnerValue(v)
    }

    function handleKeyUp(evt: KeyboardEvent<HTMLInputElement>) {
        if (evt.key === 'Escape') {
            setEditing(false)
            setInnerValue(value)
            return
        }

        if (evt.key === 'Enter') {
            setEditing(false)
            const v = (evt.target as HTMLInputElement).value
            onChange(v ? Number(v) : null)
        }
    }

    return editing ? (
        <InputNumber
            ref={editInput}
            size="small"
            value={innerValue}
            min={0}
            step={1}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
        />
    ) : (
        <div style={{minHeight: 22}} onDoubleClick={startEditing}>
            {innerValue}
        </div>
    )
}