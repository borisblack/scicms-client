import type {FC} from 'react'
import {useState} from 'react'

import type {PropertyValueProps} from './types'
import {FieldType} from 'src/types'
import Editor from 'src/uiKit/Editor'
import {EditorMode} from 'src/uiKit/Editor/constants'
import {Expandable} from 'src/uiKit/Expandable/Expandable'
import {useProperty} from 'src/util/hooks'
import './PropertyValue.css'

const EXPANDED_EDITOR_HEIGHT = '90vh'

export const JsonPropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  if (type !== FieldType.json && type !== FieldType.array)
    throw new Error('Illegal type.')

  const editorHeight = useProperty('ui.form.editorHeight') as string
  const [height, setHeight] = useState(editorHeight)

  function toggleExpanded(expanded: boolean) {
    setHeight(expanded ? EXPANDED_EDITOR_HEIGHT : editorHeight)
  }

  return (
    <Expandable onToggle={toggleExpanded}>
      <div className="property-value-editor">
        <Editor
          value={value ?? undefined}
          mode={EditorMode.JAVASCRIPT}
          height={height}
          lineNumbers={false}
          canEdit={canEdit}
          onChange={onChange}
        />
      </div>
    </Expandable>
  )
}
