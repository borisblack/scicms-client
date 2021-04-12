import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {I18nextProvider, useTranslation} from 'react-i18next'
import {Avatar, ConfigProvider, Layout, Menu} from 'antd'
import {LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined} from '@ant-design/icons'
import { useQuery, gql } from '@apollo/client'

import './App.css'
import config from './config'
import i18n from './i18n'
import {logout, selectUserInfo} from './features/auth/authSlice'
import Login from './features/auth/Login'
import Navbar from './features/navigation/Navbar'

const {Header, Content, Footer} = Layout
const SubMenu = Menu.SubMenu

const isNavbarCollapsed = () => localStorage.getItem('navbarCollapsed') === '1'

const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('navbarCollapsed', collapsed ? '1' : '0')

export const USER_QUERY = gql`
    query queryUser {
        queryUser(action: "get") {
            username
            listOfAuthority {
                authority
            }
        }
    }
`
function App() {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const userInfo = useSelector(selectUserInfo)
    const [collapsed, setCollapsed] = useState(isNavbarCollapsed())
    const { loading, error, data } = useQuery(USER_QUERY, {errorPolicy: 'all'})

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
            <ConfigProvider locale={config.locale}> {userInfo ? (
                <Layout className="App">
                    <Navbar collapsed={collapsed}/>
                    <Layout>
                        <Header className="App-header">
                            {renderToggleIcon()}
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
                                <div>
                                    <p>Users are loading: {loading ? "yes" : "no"}</p>
                                    {data && data.queryUser.map((user: any) => <div key={user.username}>{user.username}</div>)}
                                    <pre>
                                        Bad: {error?.graphQLErrors.map(({ message }, i) => (
                                            <span key={i}>{message}</span>
                                        ))}
                                    </pre>
                                </div>
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
