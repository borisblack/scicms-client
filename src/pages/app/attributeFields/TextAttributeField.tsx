import type {FC} from 'react'
import {useState} from 'react'
import {useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Form, Input} from 'antd'

import {AttributeFieldProps} from '.'
import {FieldType} from 'src/types'
import {generateKey} from 'src/util/mdi'
import {Expandable} from 'src/uiKit/Expandable/Expandable'
import Editor from 'src/uiKit/Editor'
import {useItemAcl, useProperty} from 'src/util/hooks'
import {EditorMode} from 'src/uiKit/Editor/constants'
import styles from './AttributeField.module.css'

const EXPANDED_EDITOR_HEIGHT = '90vh'

const FormItem = Form.Item


const TextAttributeField: FC<AttributeFieldProps> = ({data: dataWrapper, form, attrName, attribute, value}) => {
  if (attribute.type !== FieldType.text)
    throw new Error('Illegal attribute')

  const uniqueKey = generateKey(dataWrapper)
  const {item, data} = dataWrapper
  const {t} = useTranslation()
  const editorHeight = useProperty('ui.form.editorHeight') as string
  const [height, setHeight] = useState(editorHeight)
  const acl = useItemAcl(item, data)
  const canEdit = useMemo(
    () => acl.canWrite && !attribute.keyed && !attribute.readOnly,
    [acl.canWrite, attribute.keyed, attribute.readOnly]
  )

  const mode = useMemo(() => {
    if (!attribute.format)
      return undefined

    if (!Object.values(EditorMode).includes(attribute.format as EditorMode))
      return undefined

    return attribute.format as EditorMode
  }, [attribute.format])

  const handleChange = useCallback((val: string | null | undefined) => {
    form.setFieldValue(attrName, val)
  }, [attrName, form])

  function toggleExpanded(expanded: boolean) {
    setHeight(expanded ? EXPANDED_EDITOR_HEIGHT : editorHeight)
  }

  return (
    <>
      <FormItem
        className={styles.formItem}
        name={attrName}
        label={t(attribute.displayName)}
        hidden={attribute.fieldHidden}
        initialValue={value ?? attribute.defaultValue}
        rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
      >
        <Input id={`${uniqueKey}#${attrName}`} hidden/>
      </FormItem>

      {!attribute.fieldHidden && (
        <div className="attribute-field-editor-wrapper">
          <Expandable onToggle={toggleExpanded}>
            <div className="attribute-field-editor">
              <Editor
                value={value ?? undefined}
                mode={mode}
                height={height}
                lineNumbers={false}
                canEdit={canEdit}
                onChange={handleChange}
              />
            </div>
          </Expandable>
        </div>
      )}
    </>
  )
}

export default TextAttributeField