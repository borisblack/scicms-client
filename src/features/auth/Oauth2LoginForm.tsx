import _ from 'lodash'
import {useCallback, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Form, Select} from 'antd'

import {Oauth2ProviderConfig} from 'src/types'
import {usePrevious} from 'src/util/hooks'
import {requiredFieldRule} from 'src/util/form'

interface Oauth2LoginFormProps {
    oauth2Providers: Oauth2ProviderConfig[]
    onLogin: (credentials: {provider: string}) => void
}

interface Oauth2LoginFormValues {
    provider: string
}

const OAUTH_PROVIDER_KEY = 'oauth2Provider'

const FormItem = Form.Item

function Oauth2LoginForm({oauth2Providers, onLogin}: Oauth2LoginFormProps) {
    const {t} = useTranslation()
    const prevOauth2Providers = usePrevious(oauth2Providers)
    const [form] = Form.useForm()

    useEffect(() => {
        if (prevOauth2Providers != null && !_.isEqual(oauth2Providers, prevOauth2Providers))
            form.resetFields()
    }, [oauth2Providers])

    function handleOauth2ProviderSelect(provider: string) {
        localStorage.setItem(OAUTH_PROVIDER_KEY, provider)
    }

    function handleFinish(values: Oauth2LoginFormValues) {
        onLogin(values)
    }

    return (
        <div>
            <Form form={form} className="Oauth2LoginForm" onFinish={handleFinish}>
                <FormItem
                    name="provider"
                    initialValue={localStorage.getItem(OAUTH_PROVIDER_KEY) || undefined}
                    rules={[requiredFieldRule('Select provider')]}
                >
                    <Select
                        placeholder={t('OAuth2 Provider')}
                        size="large"
                        options={oauth2Providers.map(provider => ({
                            value: provider.id,
                            label: provider.name
                        }))}
                        onSelect={handleOauth2ProviderSelect}
                    />
                </FormItem>
                <FormItem>
                    <Button
                        block
                        type="primary"
                        size="large"
                        onClick={() => form.submit()}
                    >
                        {t('Login')}
                    </Button>
                </FormItem>
            </Form>
        </div>
    )
}

export default Oauth2LoginForm
