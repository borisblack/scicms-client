import {useEffect, useRef} from 'react'
import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/sql/sql'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/eclipse.css'
import {Editor} from 'codemirror'

interface SqlEditorProps {
    value?: string
    height: number | string
    lineNumbers?: boolean
    lineWrapping?: boolean
    canEdit: boolean
    onChange: (value: string) => void
}

export default function SqlEditor({value, height, lineNumbers, lineWrapping, canEdit, onChange}: SqlEditorProps) {
    const editorRef = useRef<Editor>()

    useEffect(() => {
        if (editorRef.current)
            editorRef.current.setSize('auto', height)
    }, [height])

    function handleChange(newValue: string) {
        if (canEdit && newValue !== value)
            onChange(newValue)
    }

    return (
        <CodeMirror
            value={value}
            options={{
                mode: {
                    name: 'sql'
                },
                theme: 'eclipse',
                lineNumbers,
                lineWrapping,
                readOnly: !canEdit
            }}
            editorDidMount={editor => editorRef.current = editor}
            onChange={(editor, data, value) => handleChange(value)}
        />
    )
}