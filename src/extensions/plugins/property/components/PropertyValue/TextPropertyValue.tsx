import type {FC} from 'react'
import {useState} from 'react'

import type {PropertyValueProps} from './types'
import {FieldType} from 'src/types'
import Editor from 'src/components/Editor'
import appConfig from 'src/config'
import {Expandable} from 'src/components/Expandable/Expandable'
import './PropertyValueEditor.css'

const {editorHeight} = appConfig.ui.form

const EXPANDED_EDITOR_HEIGHT = '90vh'

export const TextPropertyValue: FC<PropertyValueProps> = ({type, value, canEdit, onChange}) => {
  if (type !== FieldType.text)
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
          height={height}
          lineNumbers={false}
          canEdit={canEdit}
          onChange={onChange}
        />
      </div>
    </Expandable>
  )
}
