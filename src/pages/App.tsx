import React, {useCallback} from 'react'
import {Navigate} from 'react-router-dom'
import {Layout} from 'antd'
import {useAppDispatch, useAppSelector} from '../util/hooks'
import {logout, selectIsExpired, selectMe} from '../features/auth/authSlice'
import {reset as resetRegistry} from '../features/registry/registrySlice'
import {reset as resetPages} from '../features/pages/pagesSlice'
import Navbar from '../features/registry/Navbar'
import Pages from '../features/pages/Pages'
import './App.css'

const {Content, Footer} = Layout

function App() {
    const dispatch = useAppDispatch()
    const me = useAppSelector(selectMe)
    const isExpired = useAppSelector(selectIsExpired)

    const handleLogout = useCallback(async () => {
        await dispatch(logout())
        await dispatch(resetPages())
        await dispatch(resetRegistry())
    }, [dispatch])

    if (!me || isExpired)
        return <Navigate to="/login"/>

    return (
        <Layout className="App">
            <Navbar me={me} onLogout={handleLogout}/>
            <Layout>
                <Content className="App-content-wrapper">
                    <div className="App-content">
                        <Pages me={me} onLogout={handleLogout}/>
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

export default App
