import _ from 'lodash'
import React, {useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Navigate} from 'react-router-dom'
import {Tab} from 'rc-tabs/lib/interface'
import {Layout, Menu, Spin, Tabs} from 'antd'
import {FundOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons'
import {useAppDispatch, useAppSelector} from '../util/hooks'
import {logout, selectIsExpired, selectMe} from '../features/auth/authSlice'
import {reset as resetRegistry} from '../features/registry/registrySlice'
import {reset as resetPages} from '../features/pages/pagesSlice'
import DashboardService from '../services/dashboard'
import {Dashboard} from '../types'
import DashboardPanel from '../dashboard/DashboardPanel'
import './Analysis.css'

const {Content, Sider} = Layout

const isNavbarCollapsed = () => localStorage.getItem('analysisNavbarCollapsed') === '1'
const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('analysisNavbarCollapsed', collapsed ? '1' : '0')
const dashboardService = DashboardService.getInstance()

function Analysis() {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const me = useAppSelector(selectMe)
    const isExpired = useAppSelector(selectIsExpired)
    const [collapsed, setCollapsed] = useState(isNavbarCollapsed())
    const [dashboards, setDashboards] = useState<Dashboard[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [tabPages, setTabPages] = useState<{[key: string]: Dashboard}>({})
    const [activeKey, setActiveKey] = useState<string | undefined>()

    useEffect(() => {
        setLoading(true)
        dashboardService.findAll()
            .then(data => setDashboards(data))
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const handleToggle = useCallback(() => {
        setNavbarCollapsed(!collapsed)
        setCollapsed(!collapsed)
    }, [collapsed])

    const handleLogout = useCallback(async () => {
        await dispatch(logout())
        await dispatch(resetPages())
        await dispatch(resetRegistry())
    }, [dispatch])

    const handleTabsChange = useCallback((key: string) => {
        setActiveKey(key)
    }, [])

    const closeTab = useCallback((key: string) => {
        const newTabPages = _.clone(tabPages)
        delete newTabPages[key]
        setTabPages(newTabPages)

        const keys = Object.keys(newTabPages)
        setActiveKey(keys.length > 0 ? keys[keys.length - 1] : undefined)
    }, [tabPages])

    const handleTabsEdit = useCallback((e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        if (action === 'remove')
            closeTab(e as string)
    }, [closeTab])

    const openDashboard = useCallback((dashboard: Dashboard) => {
        const key = dashboard.id
        if (!tabPages.hasOwnProperty(key)) {
            const newTabPages = _.clone(tabPages)
            newTabPages[key] = dashboard
            setTabPages(newTabPages)
        }

        setActiveKey(key)
    }, [tabPages])

    if (!me || isExpired)
        return <Navigate to="/login?targetUrl=/analysis"/>

    const getTabs = (): Tab[] => Object.keys(tabPages).map(key => {
        const dashboard = tabPages[key]
        return {
            key,
            label: dashboard.name,
            style: {background: '#fff'},
            children: (
                <div className="Analysis-page-content">
                    <DashboardPanel me={me} pageKey={key} spec={dashboard.spec}/>
                </div>
            )
        }
    })

    const tabs = getTabs()

    return (
        <Layout className="Analysis">
            <Sider collapsible collapsed={collapsed} onCollapse={handleToggle} width={250}>
                <Spin spinning={loading}>
                    <Menu
                        mode="inline"
                        theme="dark"
                        defaultOpenKeys={['dashboards']}
                        items={[{
                            key: 'profile',
                            label: `${t('Profile')} (${me.username})`,
                            icon: <UserOutlined />,
                            className: 'Analysis-profile-menu-item',
                            children: [{
                                key: 'logout',
                                label: t('Logout'),
                                icon: <LogoutOutlined/>,
                                onClick: handleLogout
                            }]
                        }, {
                            key: 'dashboards',
                            label: t('Dashboards'),
                            icon: <FundOutlined />,
                            children: dashboards.map(d => ({
                                key: d.name,
                                label: d.name,
                                onClick: () => openDashboard(d)
                            }))
                        }]}
                    />
                </Spin>
            </Sider>
            <Layout>
                <Content className="Analysis-content-wrapper">
                    <div className="Analysis-content">
                        {(tabs.length > 0) && (
                            <Tabs
                                activeKey={activeKey}
                                hideAdd
                                type="editable-card"
                                className="pages"
                                items={getTabs()}
                                onChange={handleTabsChange}
                                onEdit={handleTabsEdit}
                            />
                        )}
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

export default Analysis
