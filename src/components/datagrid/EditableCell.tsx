import {Input} from 'antd'
import {ChangeEvent, KeyboardEvent, useState} from 'react'

interface Props {
    value: any
    onChange: (value: any) => void
}

export default function EditableCell({value, onChange}: Props) {
    const [innerValue, setInnerValue] = useState(value)
    const [editing, setEditing] = useState(false)

    function handleKeyUp(evt: KeyboardEvent<any>) {
        if (evt.key === 'Enter') {
            setEditing(false)
            onChange(evt.target.value)
        }
    }

    function handleChange(evt: ChangeEvent<any>) {
        setInnerValue(evt.target.value)
    }

    return editing ? (
        <Input
            size="small"
            value={innerValue ?? ''}
            onKeyUp={handleKeyUp}
            onChange={handleChange}
        />
    ) : (
        <span onDoubleClick={() => {console.log('editing'); setEditing(true)}}>
            {innerValue}
        </span>
    )
}