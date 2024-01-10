import CodeMirror, {EditorView, Extension} from '@uiw/react-codemirror'
import {sql, StandardSQL} from '@codemirror/lang-sql'
import {javascript} from '@codemirror/lang-javascript'

import {EditorMode} from './constants'
import './Editor.css'

export interface EditorProps {
    value?: string
    mode: EditorMode
    height?: string
    lineNumbers?: boolean
    canEdit: boolean
    onChange?: (value: string) => void
}

const FontSizeTheme = EditorView.theme({
    '&': {
        fontSize: "10pt" // default - 10.5pt
    }
});

function getExtensions(mode: EditorMode): Extension[] {
    switch (mode) {
        case EditorMode.SQL:
            return [sql({dialect: StandardSQL})]
        case EditorMode.JAVASCRIPT:
        default:
            return [javascript({jsx: true})]
    }
}

export default function Editor({value, mode, height, lineNumbers, canEdit, onChange}: EditorProps) {
    function handleChange(newValue: string) {
        if (canEdit && newValue !== value && onChange)
            onChange(newValue)
    }

    return (
        <CodeMirror
            value={value}
            height={height}
            extensions={[FontSizeTheme, ...getExtensions(mode)]}
            editable={canEdit}
            basicSetup={{
                lineNumbers
            }}
            onChange={handleChange}
        />
    )
}