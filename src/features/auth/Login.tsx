import React, {useEffect} from 'react'
import {Col, Layout, message, Row, Spin} from 'antd'

import logo from '../../logo.svg'
import './Login.css'
import {fetchMeIfNeeded, login, selectError, selectIsExpired, selectJwt, selectLoading, selectMe} from './authSlice'
import LoginForm from './LoginForm'
import {useTranslation} from 'react-i18next'
import {useAppDispatch, useAppSelector} from '../../hooks'

const {Header, Content, Footer} = Layout

function Login() {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const jwt = useAppSelector(selectJwt)
    const isExpired = useAppSelector(selectIsExpired)
    const me = useAppSelector(selectMe)
    const authError = useAppSelector(selectError)
    const loading = useAppSelector(selectLoading)

    useEffect(() => {
        if (jwt && !isExpired && !me)
            dispatch(fetchMeIfNeeded())
    }, [jwt, isExpired, me, dispatch])

    useEffect(() => {
        if (authError)
            message.error(authError.message)
    }, [authError])

    const handleLogin = async (credentials: {username: string, password: string}) => {
        try {
            await dispatch(login(credentials))
        } catch (e: any) {
            message.error(e.message)
        }
    }

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
                            {/*<MultipartScriptUpload/>*/}
                            {/*<UploadFile/>*/}
                            {/*<UploadFiles/>*/}
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
