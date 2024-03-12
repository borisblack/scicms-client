import {useCallback, useEffect, useState} from 'react'
import {Navigate, useLocation, useParams, useSearchParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import type {TabsProps} from 'antd'
import {Col, Layout, Row, Spin, Tabs} from 'antd'
import {v4 as uuidv4} from 'uuid'

import {
    fetchMeIfNeeded,
    fetchSecurityConfig,
    login,
    loginOauth2,
    selectIsExpired,
    selectJwt,
    selectLoading,
    selectMe,
    selectSecurityConfig
} from './authSlice'
import LoginForm from './LoginForm'
import {useAppDispatch, useAppSelector} from 'src/util/hooks'
import Oauth2LoginForm from './Oauth2LoginForm'
import logo from 'src/logo.svg'
import './Login.css'

const AUTH_TYPE_KEY = 'authType'
const LOCAL_AUTH_TYPE = 'local'
const OAUTH2_AUTH_TYPE = 'oauth2'
const OAUTH2_VERIFICATION_CODE_KEY = 'oauth2VerificationCode'
const TARGET_URL_KEY = 'targetUrl'

const {Header, Content, Footer} = Layout

function generateOauth2VerificationCode(): string {
    const oauth2VerificationCode = uuidv4()
    localStorage.setItem(OAUTH2_VERIFICATION_CODE_KEY, oauth2VerificationCode)
    return oauth2VerificationCode
}

function storeTargetUrl(targetUrl: string) {
    localStorage.setItem(TARGET_URL_KEY, targetUrl)
}

function Login() {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const securityConfig = useAppSelector(selectSecurityConfig)
    const jwt = useAppSelector(selectJwt)
    const isExpired = useAppSelector(selectIsExpired)
    const me = useAppSelector(selectMe)
    const loading = useAppSelector(selectLoading)
    const [searchParams,] = useSearchParams()
    const defaultAuthType = localStorage.getItem(AUTH_TYPE_KEY) || LOCAL_AUTH_TYPE
    const targetUrl = searchParams.get('targetUrl') || localStorage.getItem(TARGET_URL_KEY) || '/'
    const location = useLocation()
    const urlParams = useParams()
    const [isOauth2Redirecting, setOauth2Redirecting] = useState(false)
    
    storeTargetUrl(targetUrl)

    useEffect(() => {
        dispatch(fetchSecurityConfig())
    }, [dispatch])

    useEffect(() => {
        if (location.pathname.startsWith('/auth/oauth2/')) {
            const oauth2VerificationCode = searchParams.get('state')
            if (oauth2VerificationCode !== localStorage.getItem(OAUTH2_VERIFICATION_CODE_KEY))
                throw new Error('Invalid OAuth2 verification code.')

            const provider = urlParams['provider']
            const code = searchParams.get('code')
            if (!provider || !code)
                throw new Error('Invalid OAuth2 credentials.')

            dispatch(loginOauth2({provider, code}))
        }
    }, [location.pathname])

    useEffect(() => {
        if (jwt && !isExpired && !me)
            dispatch(fetchMeIfNeeded())
    }, [jwt, isExpired, me, dispatch])

    const handleLogin = useCallback(async (credentials: {username: string, password: string}) => {
        dispatch(login(credentials))
    }, [dispatch])

    const handleOauth2Redirect = (credentials: {provider: string}) => {
        const {provider: providerId} = credentials
        const provider = securityConfig.oauth2Providers.find(p => p.id === providerId)
        if (provider == null)
            throw new Error('Provider not found.')

        setOauth2Redirecting(true)
        const authUrl = new URL(provider.authUrl)
        authUrl.searchParams.append('client_id', provider.clientId)
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('state', generateOauth2VerificationCode())
        window.location.href = authUrl.toString()
    }

    const handleTabsChange = (key: string) => {
        localStorage.setItem(AUTH_TYPE_KEY, key)
    }

    const tabs: TabsProps['items'] = [
        {
            key: LOCAL_AUTH_TYPE,
            label: 'Local',
            children: <LoginForm onLogin={handleLogin}/>,
        },
        {
            key: OAUTH2_AUTH_TYPE,
            label: 'OAuth2',
            children: (
                <Oauth2LoginForm
                    oauth2Providers={securityConfig.oauth2Providers}
                    onLogin={handleOauth2Redirect}
                />
            )
        }
    ]

    if (me && !isExpired)
        return <Navigate to={targetUrl}/>

    return (
        <Layout className="Login">
            <Header className="Login-header">
                <img src={logo} className="Login-logo" alt="logo" />
                <span className="Login-header-title">{t('SciCMS')}</span>
                <div className="Login-header-desc">{t('Welcome')}</div>
            </Header>
            <Content>
                <Spin spinning={loading || isOauth2Redirecting}>
                    <Row justify="center" align="middle">
                        <Col span={6}>
                            <Tabs
                                className="Login-tabs"
                                defaultActiveKey={defaultAuthType}
                                items={tabs}
                                onChange={handleTabsChange}
                            />
                        </Col>
                    </Row>
                </Spin>
            </Content>
            <Footer className="Login-footer">
                {`${t('SciSolutions')} ©${new Date().getFullYear()}`}
            </Footer>
        </Layout>
    )
}

export default Login
