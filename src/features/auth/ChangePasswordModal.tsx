import {Form, Modal, notification, Spin} from 'antd'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {changePassword} from 'src/services/auth'
import ChangePasswordForm from './ChangePasswordForm'

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

interface ChangePasswordFormValues {
  oldPassword: string
  newPassword: string
}

export default function ChangePasswordModal({open, onClose}: ChangePasswordModalProps) {
  const {t} = useTranslation()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  async function handleFormFinish(values: ChangePasswordFormValues) {
    try {
      setLoading(true)
      const {oldPassword, newPassword} = values
      await changePassword({oldPassword, newPassword})
      onClose()
    } catch (e: any) {
      console.error(e.message)
      notification.error({
        message: t('Password changing error'),
        description: e.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={t('Password changing')} open={open} destroyOnClose onOk={() => form.submit()} onCancel={onClose}>
      <Spin spinning={loading}>
        <Form form={form} labelCol={{span: 8}} wrapperCol={{span: 16}} layout="horizontal" onFinish={handleFormFinish}>
          <ChangePasswordForm />
        </Form>
      </Spin>
    </Modal>
  )
}
