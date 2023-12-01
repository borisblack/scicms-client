import _ from 'lodash'
import React, {useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Navigate} from 'react-router-dom'
import {Layout, Menu, Spin} from 'antd'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import {FolderOutlined, FundOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons'
import {useAppDispatch, useAuth, useRegistry} from 'src/util/hooks'
import * as DashboardService from 'src/services/dashboard'
import {Dashboard, DashboardCategory, DashboardExtra, ItemDataWrapper, ViewType} from 'src/types'
import biConfig from 'src/config/bi'
import * as DashboardCategoryService from 'src/services/dashboard-category'
import {allIcons} from 'src/util/icons'
import {DASHBOARD_ITEM_NAME} from 'src/config/constants'
import {useNewMDIContext} from 'src/components/mdi-tabs/hooks'
import MDITabs from 'src/components/mdi-tabs/MDITabs'
import logo from 'src/logo.svg'
import './Bi.css'
import {createDashboardMDITab} from '../../util/mdi'

const {Content, Sider} = Layout

const isNavbarCollapsed = () => localStorage.getItem('biNavbarCollapsed') === '1'
const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('biNavbarCollapsed', collapsed ? '1' : '0')

function Bi() {
    const dispatch = useAppDispatch()
    const {t} = useTranslation()
    const {me, isExpired, logout} = useAuth()
    const {isInitialized, items: itemMap, initializeIfNeeded, reset: resetRegistry} = useRegistry()
    const mdiContext = useNewMDIContext<ItemDataWrapper>([])
    const [collapsed, setCollapsed] = useState(isNavbarCollapsed())
    const [dashboardMap, setDashboardMap] = useState<Record<string, Dashboard>>({})
    const [dashboardCategoryMap, setDashboardCategoryMap] = useState<Record<string, DashboardCategory>>({})
    const [loading, setLoading] = useState<boolean>(false)
    const dashboardItem = itemMap[DASHBOARD_ITEM_NAME]

    useEffect(() => {
        document.title = t('SciCMS BI')
    }, [t])

    useEffect(() => {
        if (me) {
            initializeIfNeeded(me)
        }
    }, [me, initializeIfNeeded])

    useEffect(() => {
        if (isInitialized) {
            initializePage()
        }
    }, [isInitialized])

    function initializePage() {
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
    }

    function openDashboard(dashboard: Dashboard, extra?: DashboardExtra) {
        mdiContext.openTab(createDashboardMDITab({
            item: dashboardItem,
            viewType: ViewType.view,
            data: dashboard,
            extra
        }))
    }

    const handleToggle = useCallback(() => {
        setNavbarCollapsed(!collapsed)
        setCollapsed(!collapsed)
    }, [collapsed])

    const handleLogout = useCallback(async () => {
        await logout()
        resetRegistry()
    }, [logout, resetRegistry])

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
            onClick: () => mdiContext.openTab(createDashboardMDITab({
                item: dashboardItem,
                viewType: ViewType.view,
                data: dashboard
            }))
        }))
    ])

    if (!me || isExpired)
        return <Navigate to="/login?targetUrl=/bi"/>

    if (!isInitialized)
        return null

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
                        <MDITabs
                            ctx={mdiContext}
                            className="pages"
                            type="editable-card"
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

export default Bi
