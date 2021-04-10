import React, {useEffect, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import {Col, message, Row, Spin} from 'antd'

import './Login.css'
import {logIn} from './authSlice'
import LoginForm from './LoginForm'
import {useTranslation} from 'react-i18next'

function Login() {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const _isMounted = useRef(false)

    useEffect(() => {
        _isMounted.current = true
        return () => {
            _isMounted.current = false
        }
    }, [])

    const handleLogin = async (credentials: {username: string, password: string}) => {
        setLoading(true)
        try {
            await dispatch(logIn(credentials))
        } catch (e) {
            message.error(e.message)
        } finally {
            if (_isMounted.current) setLoading(false)
        }
    }

    return (
        <Spin spinning={loading}>
            <Row className="Login" justify="center" align="middle">
                <Col span={6}>
                    <div className="Login-box">
                        <h3>{t('Login')}</h3>
                        <br/>
                        <LoginForm onLogin={handleLogin} />
                    </div>
                </Col>
            </Row>
        </Spin>
    )
}

export default Login
