import React, {useState} from 'react'
import {I18nextProvider, useTranslation} from 'react-i18next'
import {Avatar, ConfigProvider, Layout, Menu} from 'antd'
import {LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined} from '@ant-design/icons'

import {useAppDispatch, useAppSelector} from './util/hooks'
import './App.css'
import config from './config'
import i18n from './i18n'
import {logout, selectIsExpired, selectMe} from './features/auth/authSlice'
import {reset as resetRegistry} from './features/registry/registrySlice'
import {reset as resetPages} from './features/pages/pagesSlice'
import Login from './features/auth/Login'
import Navbar from './features/registry/Navbar'
import Pages from './features/pages/Pages'

const {Header, Content, Footer} = Layout

const isNavbarCollapsed = () => localStorage.getItem('navbarCollapsed') === '1'

const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('navbarCollapsed', collapsed ? '1' : '0')

function App() {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const me = useAppSelector(selectMe)
    const isExpired = useAppSelector(selectIsExpired)
    const [collapsed, setCollapsed] = useState(isNavbarCollapsed())

    function handleToggle() {
        setNavbarCollapsed(!collapsed)
        setCollapsed(!collapsed)
    }

    function renderToggleIcon() {
        const props = {
            className: 'App-header-trigger',
            onClick: handleToggle
        }
        return collapsed ? <MenuUnfoldOutlined {...props}/> : <MenuFoldOutlined {...props}/>
    }

    async function handleLogout() {
        await dispatch(logout())
        await dispatch(resetPages())
        await dispatch(resetRegistry())
    }

    return (
        <I18nextProvider i18n={i18n}>
            <ConfigProvider locale={config.antdLocale}> {(me && !isExpired) ? (
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
                                <Pages/>
                            </div>
                        </Content>
                        <Footer className="App-footer">
                            {`${t('SciSolutions')} ©${new Date().getFullYear()}`}
                        </Footer>
                    </Layout>
                </Layout>
            ) : <Login/>}
            </ConfigProvider>
        </I18nextProvider>
    )
}

export default App
