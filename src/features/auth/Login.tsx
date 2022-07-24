import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Col, Layout, message, Row, Spin} from 'antd'

import logo from '../../logo.svg'
import './Login.css'
import {fetchMeIfNeeded, login, selectJwt, selectError, selectLoading, selectMe} from './authSlice'
import LoginForm from './LoginForm'
import {useTranslation} from 'react-i18next'

const {Header, Content, Footer} = Layout

function Login() {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const apiKey = useSelector(selectJwt)
    const userInfo = useSelector(selectMe)
    const authError = useSelector(selectError)
    const loading = useSelector(selectLoading)

    useEffect(() => {
        if (apiKey && !userInfo)
            dispatch(fetchMeIfNeeded())
    }, [apiKey, userInfo, dispatch])

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
