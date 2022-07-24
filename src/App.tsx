import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {I18nextProvider, useTranslation} from 'react-i18next'
import {Avatar, ConfigProvider, Layout, Menu} from 'antd'
import {LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined} from '@ant-design/icons'
// import { useQuery, gql } from '@apollo/client'

import './App.css'
import config from './config'
import i18n from './i18n'
import {logout, selectMe} from './features/auth/authSlice'
import Login from './features/auth/Login'
import Navbar from './features/navigation/Navbar'

const {Header, Content, Footer} = Layout
const SubMenu = Menu.SubMenu

const isNavbarCollapsed = () => localStorage.getItem('navbarCollapsed') === '1'

const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('navbarCollapsed', collapsed ? '1' : '0')

function App() {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const me = useSelector(selectMe)
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
        // await dispatch(resetNavigation())
        // Metadata.clear()
    }

    return (
        <I18nextProvider i18n={i18n}>
            <ConfigProvider locale={config.antdLocale}> {me ? (
                <Layout className="App">
                    <Navbar collapsed={collapsed}/>
                    <Layout>
                        <Header className="App-header">
                            {renderToggleIcon()}
                            <span className="App-header-title">{t('SciCMS')}</span>
                            <Menu theme="light" mode="horizontal" defaultSelectedKeys={[]} className="App-header-menu">
                                <SubMenu
                                    key="user"
                                    title={
                                        <span>
                                            <Avatar className="App-header-menu-avatar" icon={<UserOutlined/>} />
                                            &nbsp;&nbsp;
                                            {me.username}
                                        </span>
                                    }
                                >
                                    <Menu.Item key="logout" onClick={handleLogout}>
                                        <span><LogoutOutlined/>{t('Logout')}</span>
                                    </Menu.Item>
                                </SubMenu>
                            </Menu>
                        </Header>
                        <Content className="App-content-wrapper">
                            <div className="App-content">
                                {/*<Pages />*/}
                            </div>
                        </Content>
                        <Footer className="App-footer">
                            {`${t('JSC Information Satellite Systems')} ©${new Date().getFullYear()}`}
                        </Footer>
                    </Layout>
                </Layout>
            ) : <Login/>}
            </ConfigProvider>
        </I18nextProvider>
    )
}

export default App
