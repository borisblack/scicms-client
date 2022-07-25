import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {I18nextProvider, useTranslation} from 'react-i18next'
import {Avatar, ConfigProvider, Layout, Menu} from 'antd'
import {LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined} from '@ant-design/icons'
// import { useQuery, gql } from '@apollo/client'

import './App.css'
import config from './config'
import i18n from './i18n'
import {logout, selectIsExpired, selectMe} from './features/auth/authSlice'
import {reset as resetNavigation} from './features/navigation/navigationSlice'
import Login from './features/auth/Login'
import Navbar from './features/navigation/Navbar'

const {Header, Content, Footer} = Layout

const isNavbarCollapsed = () => localStorage.getItem('navbarCollapsed') === '1'

const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('navbarCollapsed', collapsed ? '1' : '0')

function App() {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const me = useSelector(selectMe)
    const isExpired = useSelector(selectIsExpired)
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
        // await dispatch(resetPages())
        await dispatch(resetNavigation())
        // Metadata.clear()
    }

    return (
        <I18nextProvider i18n={i18n}>
            <ConfigProvider locale={config.antdLocale}> {(me && !isExpired) ? (
                <Layout className="App">
                    <Navbar collapsed={collapsed}/>
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
                                {/*<Pages />*/}
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
