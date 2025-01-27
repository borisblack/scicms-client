import {Form, Input} from 'antd'
import {useTranslation} from 'react-i18next'
import {requiredFieldRule} from 'src/util/form'

const FormItem = Form.Item
const {Password} = Input

export default function ChangePasswordForm() {
  const {t} = useTranslation()

  return (
    <>
      <FormItem
        name="oldPassword"
        label={t('Old password')}
        // hasFeedback
        rules={[requiredFieldRule()]}
      >
        <Password />
      </FormItem>

      <FormItem
        name="newPassword"
        label={t('New password')}
        // hasFeedback
        rules={[requiredFieldRule()]}
      >
        <Password />
      </FormItem>

      <Form.Item
        name="confirm"
        label={t('Confirm')}
        dependencies={['newPassword']}
        // hasFeedback
        rules={[
          requiredFieldRule(true, 'Please confirm new password'),
          ({getFieldValue}) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error(t('Passwords do not match')))
            }
          })
        ]}
      >
        <Password />
      </Form.Item>
    </>
  )
}
