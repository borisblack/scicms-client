import React, {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Avatar, Layout, Menu} from 'antd'
import {LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined} from '@ant-design/icons'

import {useAppDispatch, useAppSelector} from './util/hooks'
import {logout, selectIsExpired, selectMe} from './features/auth/authSlice'
import {reset as resetRegistry} from './features/registry/registrySlice'
import {reset as resetPages} from './features/pages/pagesSlice'
import Navbar from './features/registry/Navbar'
import Pages from './features/pages/Pages'
import './App.css'
import {Navigate} from 'react-router-dom'

const {Header, Content, Footer} = Layout

const isNavbarCollapsed = () => localStorage.getItem('navbarCollapsed') === '1'

const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('navbarCollapsed', collapsed ? '1' : '0')

function App() {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const me = useAppSelector(selectMe)
    const isExpired = useAppSelector(selectIsExpired)
    const [collapsed, setCollapsed] = useState(isNavbarCollapsed())

    const handleToggle = useCallback(() => {
        setNavbarCollapsed(!collapsed)
        setCollapsed(!collapsed)
    }, [collapsed])

    const renderToggleIcon = useCallback(() => {
        const props = {
            className: 'App-header-trigger',
            onClick: handleToggle
        }
        return collapsed ? <MenuUnfoldOutlined {...props}/> : <MenuFoldOutlined {...props}/>
    }, [collapsed, handleToggle])

    const handleLogout = useCallback(async () => {
        await dispatch(logout())
        await dispatch(resetPages())
        await dispatch(resetRegistry())
    }, [dispatch])

    if (!me || isExpired)
        return <Navigate to="/login"/>

    return (
        <Layout className="App">
            <Navbar collapsed={collapsed} me={me}/>
            <Layout>
                <Header className="App-header">
                    {renderToggleIcon()}
                    <span className="App-header-title">{t('SciCMS')}</span>
                    <Menu
                        theme="light"
                        mode="horizontal"
                        defaultSelectedKeys={[]}
                        className="App-header-menu"
                        items={[{
                            key: 'user',
                            label: (
                                <span>
                                    <Avatar className="App-header-menu-avatar" icon={<UserOutlined/>}/>
                                    &nbsp;&nbsp;
                                    {me.username}
                                </span>
                            ),
                            children: [{
                                key: 'logout',
                                label: <span><LogoutOutlined/> {t('Logout')}</span>,
                                onClick: handleLogout
                            }]
                        }]}
                    />
                </Header>
                <Content className="App-content-wrapper">
                    <div className="App-content">
                        <Pages me={me} onLogout={handleLogout}/>
                    </div>
                </Content>
                <Footer className="App-footer">
                    {`${t('SciSolutions')} ©${new Date().getFullYear()}`}
                </Footer>
            </Layout>
        </Layout>
    )
}

export default App
