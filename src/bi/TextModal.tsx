import _ from 'lodash'
import {useTranslation} from 'react-i18next'
import {Button, Drawer, Form, Space} from 'antd'

import {IText} from '../types/bi'
import TextForm, {TextFormValues} from './TextForm'

interface TextFormModalProps {
    text: IText
    open: boolean
    canEdit: boolean
    onChange: (text: IText) => void
    onClose: () => void
}

export default function TextModal({text, canEdit, open, onChange, onClose}: TextFormModalProps) {
  const {t} = useTranslation()
  const [form] = Form.useForm()

  function handleFormFinish(values: TextFormValues) {
    onChange({...values})
    onClose()
  }

  function cancelEdit() {
    form.resetFields()
    onClose()
  }

  return (
    <Drawer
      className="no-drag"
      title={t('Text')}
      open={open}
      destroyOnClose
      // width="70%"
      // onOk={() => form.submit()}
      extra={
        <Space>
          <Button onClick={cancelEdit}>{t('Cancel')}</Button>
          <Button disabled={!canEdit} type="primary" onClick={() => form.submit()}>OK</Button>
        </Space>
      }
      onClose={onClose}
    >
      <Form
        form={form}
        size="small"
        layout="vertical"
        disabled={!canEdit}
        initialValues={text}
        onFinish={handleFormFinish}
      >
        <TextForm
          text={text}
          canEdit={canEdit}
        />
      </Form>
    </Drawer>
  )
}