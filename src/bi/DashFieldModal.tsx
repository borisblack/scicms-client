import React from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Drawer, Form, Space} from 'antd'

import {NamedColumn} from 'src/types/bi'
import FieldForm from './FieldForm'
import {Column} from 'src/types/bi'

interface DashFieldModalProps {
    field: NamedColumn
    allFields: Record<string, Column>
    open: boolean
    canEdit: boolean
    onChange: (field: NamedColumn, prevName: string) => void
    onClose: () => void
}

interface FieldFormValues extends NamedColumn {}

export default function DashFieldModal({field, allFields, open, canEdit, onChange, onClose}: DashFieldModalProps) {
  const {t} = useTranslation()
  const [form] = Form.useForm()

  function handleFormFinish(values: FieldFormValues) {
    if (!canEdit)
      return

    onChange({...field, ...values}, field.name)
    onClose()
  }

  return (
    <Drawer
      title={t('Field')}
      open={open}
      destroyOnClose
      width={500}
      extra={
        <Space>
          <Button onClick={onClose}>{t('Cancel')}</Button>
          <Button disabled={!canEdit} type="primary" onClick={() => form.submit()}>OK</Button>
        </Space>
      }
      onClose={onClose}
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
        <FieldForm
          field={field}
          allFields={allFields}
          canEdit={canEdit}
        />
      </Form>
    </Drawer>
  )
}