import type {FC} from 'react'
import {useState} from 'react'

import type {PropertyValueProps} from './types'
import {FieldType} from 'src/types'
import appConfig from 'src/config'
import Editor from 'src/uiKit/Editor'
import {EditorMode} from 'src/uiKit/Editor/constants'
import {Expandable} from 'src/uiKit/Expandable/Expandable'
import './PropertyValue.css'

const {editorHeight} = appConfig.ui.form

const EXPANDED_EDITOR_HEIGHT = '90vh'

export const JsonPropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  if (type !== FieldType.json && type !== FieldType.array)
    throw new Error('Illegal type.')

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
