import {useRef} from 'react'
import {Checkbox} from 'antd'
import {CheckboxChangeEvent} from 'antd/es/checkbox'

interface Props {
  value: boolean
  disabled: boolean
  onChange: (value: boolean) => void
}

export function CheckboxCell({value, disabled, onChange}: Props) {
  const checkboxInput = useRef<HTMLInputElement>(null)

  function handleChange(e: CheckboxChangeEvent) {
    onChange(e.target.checked)
  }

  return (
    <div style={{textAlign: 'center'}}>
      <Checkbox ref={checkboxInput} checked={value} disabled={disabled} onChange={handleChange} />
    </div>
  )
}
