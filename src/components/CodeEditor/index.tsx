import {useEffect, useRef} from 'react'
import {UnControlled as CodeMirror} from 'react-codemirror2'
import {Editor} from 'codemirror'
import 'codemirror/mode/sql/sql'
import 'codemirror/mode/javascript/javascript'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/eclipse.css'
import './CodeEditor.css'

interface EditorProps {
    value?: string
    mode: EditorMode
    height: number | string
    lineNumbers?: boolean
    lineWrapping?: boolean
    canEdit: boolean
    onChange?: (value: string) => void
}

export enum EditorMode {
    JAVASCRIPT = 'javascript',
    SQL = 'sql'
}

export default function CodeEditor({value, mode, height, lineNumbers, lineWrapping, canEdit, onChange}: EditorProps) {
    const editorRef = useRef<Editor>()

    useEffect(() => {
        if (editorRef.current)
            editorRef.current.setSize('auto', height)
    }, [height])

    function handleChange(newValue: string) {
        if (canEdit && newValue !== value && onChange)
            onChange(newValue)
    }

    return (
        <CodeMirror
            value={value}
            options={{
                mode: {
                    name: mode
                },
                theme: 'eclipse',
                lineNumbers,
                lineWrapping,
                readOnly: !canEdit,
            }}
            editorDidMount={editor => editorRef.current = editor}
            onChange={(editor, data, value) => handleChange(value)}
        />
    )
}