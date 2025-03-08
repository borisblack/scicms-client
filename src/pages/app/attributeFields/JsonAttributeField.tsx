import {Form, Input} from 'antd'
import {FC, useCallback, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {AttributeFieldProps} from '.'
import {FieldType} from 'src/types'
import {generateKey} from 'src/util/mdi'
import {useAppProperties, useItemAcl} from 'src/util/hooks'
import {Expandable} from 'src/uiKit/Expandable/Expandable'
import Editor from 'src/uiKit/Editor/Editor'
import {EditorMode} from 'src/uiKit/Editor/constants'
import styles from './AttributeField.module.css'

const EXPANDED_EDITOR_HEIGHT = '90vh'

const FormItem = Form.Item

const JsonAttributeField: FC<AttributeFieldProps> = ({itemTab: dataWrapper, form, attrName, attribute, value}) => {
  if (attribute.type !== FieldType.json && attribute.type !== FieldType.array) throw new Error('Illegal attribute')

  const uniqueKey = generateKey(dataWrapper)
  const {item, data} = dataWrapper
  const {t} = useTranslation()
  const appProps = useAppProperties()
  const {editorHeight} = appProps.ui.form
  const [height, setHeight] = useState(editorHeight)
  const acl = useItemAcl(item, data)
  const canEdit = useMemo(() => acl.canWrite && !attribute.readOnly, [acl.canWrite, attribute.readOnly])
  const parsedValue = useMemo(
    () => (typeof value == 'object' && value != null ? JSON.stringify(value) : value),
    [value]
  )

  const handleChange = useCallback(
    (val: string | null | undefined) => {
      form.setFieldValue(attrName, val)
    },
    [attrName, form]
  )

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
        initialValue={parsedValue ?? attribute.defaultValue}
        rules={[{required: attribute.required && !attribute.readOnly, message: t('Required field')}]}
      >
        <Input id={`${uniqueKey}#${attrName}`} hidden />
      </FormItem>

      {!attribute.fieldHidden && (
        <div className="attribute-field-editor-wrapper">
          <Expandable onToggle={toggleExpanded}>
            <div className="attribute-field-editor">
              <Editor
                value={parsedValue ?? undefined}
                mode={EditorMode.JAVASCRIPT}
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

export default JsonAttributeField
