import React, {useCallback, useEffect} from 'react'
import {Col, Layout, Row, Spin} from 'antd'

import logo from '../../logo.svg'
import './Login.css'
import {fetchMeIfNeeded, login, selectIsExpired, selectJwt, selectLoading, selectMe} from './authSlice'
import LoginForm from './LoginForm'
import {useTranslation} from 'react-i18next'
import {useAppDispatch, useAppSelector} from 'src/util/hooks'
import {Navigate, useSearchParams} from 'react-router-dom'

const {Header, Content, Footer} = Layout

function Login() {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const jwt = useAppSelector(selectJwt)
    const isExpired = useAppSelector(selectIsExpired)
    const me = useAppSelector(selectMe)
    const loading = useAppSelector(selectLoading)
    const [searchParams,] = useSearchParams()
    const targetUrl = searchParams.get('targetUrl') ?? '/'

    useEffect(() => {
        if (jwt && !isExpired && !me)
            dispatch(fetchMeIfNeeded())
    }, [jwt, isExpired, me, dispatch])

    const handleLogin = useCallback(async (credentials: {username: string, password: string}) => {
        dispatch(login(credentials))
    }, [dispatch])

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
                <Spin spinning={loading}>
                    <Row justify="center" align="middle">
                        <Col span={6}>
                            <LoginForm onLogin={handleLogin} />
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
