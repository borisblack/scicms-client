import {useEffect, useRef} from 'react'
import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/sql/sql'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/eclipse.css'

interface SqlEditorProps {
    value?: string
    height: number | string
    canEdit: boolean
    onChange: (value: string) => void
}

export default function SqlEditor({value, height, canEdit, onChange}: SqlEditorProps) {
    const editorRef = useRef<any>()

    useEffect(() => {
        if (editorRef.current)
            editorRef.current.setSize('auto', height)
    }, [height])

    return (
        <CodeMirror
            value={value}
            options={{
                mode: {
                    name: 'sql'
                },
                theme: 'eclipse',
                lineNumbers: true,
                readOnly: !canEdit
            }}
            editorDidMount={editor => editorRef.current = editor}
            onChange={(editor, data, value) => onChange(value)}
        />
    )
}