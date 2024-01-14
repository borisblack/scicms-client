import _ from 'lodash'
import React, {ReactNode, useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Navigate} from 'react-router-dom'
import {Layout, Menu, Spin} from 'antd'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import {FolderOutlined, FundOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons'
import {useAuth, useRegistry} from 'src/util/hooks'
import * as DashboardService from 'src/services/dashboard'
import {ViewType} from 'src/types'
import {ItemDataWrapper} from 'src/types/schema'
import {Dashboard, DashboardCategory, DashboardExtra} from 'src/types/bi'
import biConfig from 'src/config/bi'
import * as DashboardCategoryService from 'src/services/dashboard-category'
import {DASHBOARD_ITEM_NAME, EMPTY_ARRAY} from 'src/config/constants'
import MDITabs from 'src/components/MDITabs'
import {createMDITab, generateLabel} from 'src/util/mdi'
import DashboardSpec from 'src/bi/DashboardSpec'
import {useNewMDIContextRedux} from 'src/features/mdi/hooks'
import Icon from 'src/components/icons/Icon'
import logo from 'src/logo.svg'
import './Bi.css'

const {Content, Sider} = Layout

const isNavbarCollapsed = () => localStorage.getItem('biNavbarCollapsed') === '1'
const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('biNavbarCollapsed', collapsed ? '1' : '0')

function Bi() {
    const {t} = useTranslation()
    const {me, isExpired, logout} = useAuth()
    const {isInitialized, items: itemMap, initializeIfNeeded, reset: resetRegistry} = useRegistry()
    const mdiContext = useNewMDIContextRedux<ItemDataWrapper>(EMPTY_ARRAY)
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
        mdiContext.openTab(
            createMDITab(
                dashboardItem,
                ViewType.view,
                dashboard,
                extra
            )
        )
    }

    const handleToggle = useCallback(() => {
        setNavbarCollapsed(!collapsed)
        setCollapsed(!collapsed)
    }, [collapsed])

    const handleLogout = useCallback(async () => {
        mdiContext.reset()
        await logout()
        resetRegistry()
    }, [logout, mdiContext, resetRegistry])

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
            icon: category.icon ? <Icon iconName={category.icon}/> : <FolderOutlined />,
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
            onClick: () => mdiContext.openTab(
                createMDITab(
                    dashboardItem,
                    ViewType.view,
                    dashboard
                )
            )
        }))
    ])

    const renderDashboard = (data: ItemDataWrapper): ReactNode => (
        <div className="Bi-page-content">
            <DashboardSpec
                data={data}
                readOnly
                buffer={{}}
                onBufferChange={() => {}}
            />
        </div>
    )

    if (!me || isExpired)
        return <Navigate to="/login?targetUrl=/bi"/>

    if (!isInitialized)
        return null

    return (
        <Layout className="Bi">
            <Sider
                collapsible
                collapsed={collapsed}
                trigger={null}
                width={275}
                onCollapse={handleToggle}
            >
                <div className="Bi-logo-wrapper" onClick={handleToggle}>
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
                            getItemLabel={generateLabel}
                            renderItem={renderDashboard}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

export default Bi
