import {Input, InputRef} from 'antd'
import {ChangeEvent, KeyboardEvent, useEffect, useRef, useState} from 'react'

interface Props {
    value: any
    onChange: (value: any) => void
}

export default function EditableCell({value, onChange}: Props) {
    const [innerValue, setInnerValue] = useState(value)
    const [editing, setEditing] = useState(false)
    const editInput = useRef<InputRef>(null)

    useEffect(() => {
        setInnerValue(value)
    }, [value])

    function startEditing() {
        setEditing(true)
        setTimeout(() => editInput.current?.select(), 100)
    }

    function handleChange(evt: ChangeEvent<any>) {
        setInnerValue(evt.target.value)
    }

    function handleKeyUp(evt: KeyboardEvent<any>) {
        if (evt.key === 'Escape') {
            setEditing(false)
            setInnerValue(value)
            return
        }

        if (evt.key === 'Enter') {
            setEditing(false)
            onChange((evt.target as HTMLInputElement).value)
        }
    }

    return editing ? (
        <Input ref={editInput} size="small" value={innerValue} onChange={handleChange} onKeyUp={handleKeyUp}/>
    ) : (
        <div style={{minHeight: 22}} onDoubleClick={startEditing}>
            {innerValue}
        </div>
    )
}