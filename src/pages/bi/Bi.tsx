import _ from 'lodash'
import React, {useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Navigate} from 'react-router-dom'
import {Tab} from 'rc-tabs/lib/interface'
import {Layout, Menu, Spin, Tabs} from 'antd'
import {ExclamationCircleOutlined, FolderOutlined, FundOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons'
import {useAppDispatch, useAppSelector} from 'src/util/hooks'
import {logout, selectIsExpired, selectMe} from 'src/features/auth/authSlice'
import {
    initializeIfNeeded,
    reset as resetRegistry,
    selectIsInitialized,
    selectItems,
    selectItemTemplates,
    selectPermissions
} from 'src/features/registry/registrySlice'
import {reset as resetNavTabs} from 'src/features/nav-tabs/navTabsSlice'
import * as DashboardService from 'src/services/dashboard'
import {Dashboard, DashboardCategory, DashboardExtra} from 'src/types'
import './Bi.css'
import logo from 'src/logo.svg'
import biConfig from 'src/config/bi'
import DashboardSpecReadOnlyWrapper from 'src/bi/DashboardSpecReadOnlyWrapper'
import {objectToHash} from 'src/util'
import * as DashboardCategoryService from 'src/services/dashboard-category'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import {allIcons} from 'src/util/icons'

interface BiPage {
    dashboard: Dashboard,
    extra?: DashboardExtra
}

const {Content, Sider} = Layout

const isNavbarCollapsed = () => localStorage.getItem('biNavbarCollapsed') === '1'
const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('biNavbarCollapsed', collapsed ? '1' : '0')

function Bi() {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const me = useAppSelector(selectMe)
    const isExpired = useAppSelector(selectIsExpired)
    const isInitialized = useAppSelector(selectIsInitialized)
    const itemTemplates = useAppSelector(selectItemTemplates)
    const items = useAppSelector(selectItems)
    const permissions = useAppSelector(selectPermissions)
    const [collapsed, setCollapsed] = useState(isNavbarCollapsed())
    const [dashboardMap, setDashboardMap] = useState<Record<string, Dashboard>>({})
    const [dashboardCategoryMap, setDashboardCategoryMap] = useState<Record<string, DashboardCategory>>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [tabPages, setTabPages] = useState<Record<string, BiPage>>({})
    const [activeKey, setActiveKey] = useState<string | undefined>()

    useEffect(() => {
        document.title = t('SciCMS BI')
    }, [t])

    const openDashboard = useCallback((dashboard: Dashboard, extra?: DashboardExtra) => {
        const suffix = extra == null ? undefined : objectToHash(extra).toString()
        const key = suffix == null ? dashboard.id : `${dashboard.id}#${suffix}`
        if (!tabPages.hasOwnProperty(key)) {
            const newTabPages = _.clone(tabPages)
            newTabPages[key] = {dashboard, extra}
            setTabPages(newTabPages)
        }

        setActiveKey(key)
    }, [tabPages])

    const initialize = useCallback(() => {
        setLoading(true)
        Promise.all([
            DashboardCategoryService.fetchDashboardCategories(),
            DashboardService.fetchDashboards()
        ])
            .then(([dashboardCategoryList, dashboardList]) => {
                const dashboardCategoryById: Record<string, DashboardCategory> = _.mapKeys(dashboardCategoryList, category => category.id)
                setDashboardCategoryMap(dashboardCategoryById)

                const dashboardsById: Record<string, Dashboard> = _.mapKeys(dashboardList, dashboard => dashboard.id)
                setDashboardMap(dashboardsById)

                if (biConfig.openFirstDashboard) {
                    const publicData =
                        dashboardList.filter(dashboard => dashboard.isPublic /*&& dashboard.categories.data.length === 0*/)

                    if (publicData.length > 0)
                        openDashboard(publicData[0])
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }, [openDashboard])

    useEffect(() => {
        if (me) {
            dispatch(initializeIfNeeded(me))
                .then(() => {
                    initialize()
                })
        }
    }, [dispatch, initialize, me])

    const openDashboardById = useCallback((id: string, extra?: DashboardExtra) =>
        openDashboard(dashboardMap[id], extra), [dashboardMap, openDashboard])

    const handleToggle = useCallback(() => {
        setNavbarCollapsed(!collapsed)
        setCollapsed(!collapsed)
    }, [collapsed])

    const handleLogout = useCallback(async () => {
        await dispatch(logout())
        await dispatch(resetNavTabs())
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
        if (keys.length === 0) {
            setActiveKey(undefined)
        } else {
            if (key === activeKey)
                setActiveKey(keys[keys.length - 1])
        }
    }, [activeKey, tabPages])

    const handleTabsEdit = useCallback((e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        if (action === 'remove')
            closeTab(e as string)
    }, [closeTab])

    function getDashboardMenuItems(): ItemType[] {
        const rootCategories =
            Object.values(dashboardCategoryMap).filter(category => category.parentCategories.data.length === 0)
        const rootDashboards =
            Object.values(dashboardMap).filter(dashboard => dashboard.isPublic && dashboard.categories.data.length === 0)

        return mapDashboardMenuItems('root', rootCategories, rootDashboards)
    }

    const mapDashboardMenuItems = (
        prefix: string,
        dashboardCategoryList: DashboardCategory[],
        dashboardList: Dashboard[]
    ): ItemType[] => ([
        ...dashboardCategoryList.map(category => ({
            key: `${prefix}#${category.id}`,
            label: category.name,
            icon: category.icon ? allIcons[category.icon] : <FolderOutlined />,
            children: mapDashboardMenuItems(
                `${prefix}#${category.id}`,
                category.childCategories.data
                    .map(childCategory => dashboardCategoryMap[childCategory.id]),
                category.dashboards.data
                    .filter(childDashboard => childDashboard.isPublic)
                    .map(childDashboard => dashboardMap[childDashboard.id])
            )
        })),
        ...dashboardList.map(dashboard => ({
            key: `${prefix}#${dashboard.id}`,
            label: dashboard.name,
            onClick: () => openDashboard(dashboard)
        }))
    ])

    function getTabs(): Tab[] {
        if (!me)
            return []

        return Object.keys(tabPages).map(key => {
            const {dashboard, extra} = tabPages[key]
            return {
                key,
                label: <span>{dashboard.name}{extra && <ExclamationCircleOutlined className="tab-label-suffix orange"/>}</span>,
                style: {background: '#fff'},
                children: (
                    <div className="Bi-page-content">
                        <DashboardSpecReadOnlyWrapper
                            me={me}
                            uniqueKey={key}
                            itemTemplates={itemTemplates}
                            items={items}
                            permissions={permissions}
                            dashboard={dashboard}
                            extra={extra}
                            onDashboardOpen={openDashboardById}
                        />
                    </div>
                )
            }
        })
    }

    if (!me || isExpired)
        return <Navigate to="/login?targetUrl=/bi"/>

    if (!isInitialized)
        return null

    const tabs = getTabs()

    return (
        <Layout className="Bi">
            <Sider collapsible collapsed={collapsed} width={275} onCollapse={handleToggle}>
                <div className="Bi-logo-wrapper">
                    <img src={logo} className="Bi-logo" alt="logo"/>
                    {!collapsed && <span className="Bi-logo-text">{t('SciCMS BI')}</span>}
                </div>
                <Spin spinning={loading}>
                    <Menu
                        mode="inline"
                        theme="dark"
                        defaultOpenKeys={['dashboards']}
                        items={[{
                            key: 'profile',
                            label: `${t('Profile')} (${me.username})`,
                            icon: <UserOutlined />,
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
                            children: getDashboardMenuItems()
                        }]}
                    />
                </Spin>
            </Sider>
            <Layout>
                <Content className="Bi-content-wrapper">
                    <div className="Bi-content">
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

export default Bi