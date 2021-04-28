import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Col, Layout, message, Row, Spin} from 'antd'

import logo from '../../logo.svg'
import './Login.css'
import {fetchUserInfoIfNeeded, login, selectApiKey, selectError, selectLoading, selectUserInfo} from './authSlice'
import LoginForm from './LoginForm'
import {useTranslation} from 'react-i18next'

const {Header, Content, Footer} = Layout

function Login() {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const apiKey = useSelector(selectApiKey)
    const userInfo = useSelector(selectUserInfo)
    const authError = useSelector(selectError)
    const loading = useSelector(selectLoading)

    useEffect(() => {
        if (apiKey && !userInfo)
            dispatch(fetchUserInfoIfNeeded())
    }, [apiKey, userInfo, dispatch])

    useEffect(() => {
        if (authError)
            message.error(authError.message)
    }, [authError])

    const handleLogin = async (credentials: {username: string, password: string}) => {
        try {
            await dispatch(login(credentials))
        } catch (e) {
            message.error(e.message)
        }
    }

    return (
        <Layout className="Login">
            <Header className="Login-header">
                <img src={logo} className="Login-logo" alt="logo" />
                <span className="Login-header-title">{t('Document Management System')}</span>
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
                {`${t('JSC Information Satellite Systems')} ©${new Date().getFullYear()}`}
            </Footer>
        </Layout>
    )
}

export default Login
