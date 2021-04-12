import React, {useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Col, Layout, message, Row, Spin} from 'antd'

import logo from '../../logo.svg'
import './Login.css'
import {login, fetchUserInfoIfNeeded, selectApiKey, selectUserInfo, selectError} from './authSlice'
import LoginForm from './LoginForm'
import {useTranslation} from 'react-i18next'

const {Header, Content, Footer} = Layout

function Login() {
    const {t} = useTranslation()
    const dispatch = useDispatch()

    const [loading, setLoading] = useState(false)
    const _isMounted = useRef(false)
    const apiKey = useSelector(selectApiKey)
    const userInfo = useSelector(selectUserInfo)
    const authError = useSelector(selectError)

    useEffect(() => {
        _isMounted.current = true
        return () => {
            _isMounted.current = false
        }
    }, [])

    useEffect(() => {
        if (apiKey && !userInfo)
            dispatch(fetchUserInfoIfNeeded())
    }, [apiKey, userInfo, dispatch])

    useEffect(() => {
        if (authError)
            message.error(authError.message)
    }, [authError])

    const handleLogin = async (credentials: {username: string, password: string}) => {
        setLoading(true)
        try {
            await dispatch(login(credentials))
        } catch (e) {
            message.error(e.message)
        } finally {
            if (_isMounted.current) setLoading(false)
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
