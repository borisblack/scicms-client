import React from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Form, Input} from 'antd'
import {LockOutlined, UserOutlined} from '@ant-design/icons'

import './LoginForm.css'

type Props = {
    onLogin: Function,
}

const FormItem = Form.Item

function LoginForm({onLogin}: Props) {
    const {t} = useTranslation()
    const [form] = Form.useForm()
    const {validateFields} = form

    /**
     * Form submit handler
     */
    const handleFinish = (values: any) => {
        validateFields().then(validValues => {
            const {username, password} = validValues
            onLogin({username, password})
        })
    }

    return (
        <div>
            <Form form={form} className="LoginForm" onFinish={handleFinish}>
                <FormItem
                    name="username"
                    rules={[{required: true, message: t('Enter username')}]}
                >
                    <Input
                        prefix={<UserOutlined className="LoginForm-input-icon"/>}
                        placeholder={t('Username')}
                        size="large"
                    />
                </FormItem>
                <FormItem
                    name="password"
                    rules={[{required: true, message: t('Enter password')}]}
                >
                    <Input
                        prefix={<LockOutlined className="LoginForm-input-icon"/>}
                        placeholder={t('Password')}
                        type="password"
                        size="large"
                    />
                </FormItem>
                <FormItem>
                    <Button
                        block
                        type="primary"
                        htmlType="submit" size="large"
                    >
                        {t('Login')}
                    </Button>
                </FormItem>
            </Form>
        </div>
    )
}

export default LoginForm