import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {I18nextProvider, useTranslation} from 'react-i18next'
import {Avatar, ConfigProvider, Layout, Menu} from 'antd'

import './App.css'
import config from './config'
import i18n from './i18n'
import {logout, selectUserInfo} from './features/auth/authSlice'
import Login from './features/auth/Login'
import {LogoutOutlined, UserOutlined} from '@ant-design/icons'

const {Header, Content, Footer} = Layout
const SubMenu = Menu.SubMenu

function App() {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const userInfo = useSelector(selectUserInfo)

    async function handleLogout() {
        await dispatch(logout())
        // await dispatch(resetPages())
        // await dispatch(resetNavigation())
        // Metadata.clear()
    }

    return (
        <I18nextProvider i18n={i18n}>
            <ConfigProvider locale={config.locale}> {userInfo ? (
                <Layout className="App">
                    {/*<Navbar collapsed={collapsed}/>*/}
                    <Layout>
                        <Header className="App-header">
                            {/*{renderToggleIcon()}*/}
                            <span className="App-header-title">{t('Document Management System')}</span>
                            <Menu theme="light" mode="horizontal" defaultSelectedKeys={[]} className="App-header-menu">
                                <SubMenu
                                    key="user"
                                    title={
                                        <span>
                                            <Avatar className="App-header-menu-avatar" icon={<UserOutlined/>} />
                                            &nbsp;&nbsp;
                                            {userInfo.user.keyedName}
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
