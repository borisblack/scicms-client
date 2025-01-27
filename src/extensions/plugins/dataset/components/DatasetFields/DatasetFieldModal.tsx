import React from 'react'
import {useTranslation} from 'react-i18next'
import {Form, Modal} from 'antd'

import {NamedColumn} from 'src/types/bi'
import FieldForm from 'src/bi/FieldForm'
import {Column} from 'src/types/bi'

interface DatasetFieldModalProps {
  field: NamedColumn
  allFields: Record<string, Column>
  open: boolean
  canEdit: boolean
  onChange: (field: NamedColumn, prevName: string) => void
  onClose: () => void
}

interface FieldFormValues extends NamedColumn {}

export default function DatasetFieldModal({
  field,
  allFields,
  open,
  canEdit,
  onChange,
  onClose
}: DatasetFieldModalProps) {
  const {t} = useTranslation()
  const [form] = Form.useForm()

  function handleFormFinish(values: FieldFormValues) {
    if (!canEdit) return

    onChange({...field, ...values}, field.name)
    onClose()
  }

  return (
    <Modal
      title={t('Field')}
      open={open}
      destroyOnClose
      okButtonProps={{disabled: !canEdit, size: 'small'}}
      cancelButtonProps={{size: 'small'}}
      onOk={() => form.submit()}
      onCancel={onClose}
    >
      <Form
        form={form}
        labelCol={{span: 8}}
        wrapperCol={{span: 16}}
        layout="horizontal"
        size="small"
        disabled={!canEdit}
        initialValues={field}
        onFinish={handleFormFinish}
      >
        <FieldForm field={field} allFields={allFields} canEdit={canEdit} />
      </Form>
    </Modal>
  )
}
