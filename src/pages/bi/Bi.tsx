import _ from 'lodash'
import {ReactNode, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Navigate} from 'react-router-dom'
import {Layout} from 'antd'
import {ItemType} from 'antd/es/menu/hooks/useItems'
import {FolderOutlined, FundOutlined} from '@ant-design/icons'
import {useAuth, useRegistry} from 'src/util/hooks'
import * as DashboardService from 'src/services/dashboard'
import {ViewType} from 'src/types'
import {ItemDataWrapper} from 'src/types/schema'
import {Dashboard, DashboardCategory, DashboardExtra} from 'src/types/bi'
import biConfig from 'src/config/bi'
import * as DashboardCategoryService from 'src/services/dashboard-category'
import {DASHBOARD_ITEM_NAME, EMPTY_ARRAY} from 'src/config/constants'
import MDITabs from 'src/uiKit/MDITabs'
import {createMDITab, generateLabel} from 'src/util/mdi'
import DashboardSpec from 'src/bi/DashboardSpec'
import {useNewMDIContextRedux} from 'src/features/mdi/hooks'
import IconSuspense from 'src/uiKit/icons/IconSuspense'
import './Bi.css'
import Navbar from 'src/features/registry/Navbar'

const {Content} = Layout

function Bi() {
  const {t} = useTranslation()
  const {me, isExpired} = useAuth()
  const {isInitialized, items: itemMap, initializeIfNeeded, reset: resetRegistry} = useRegistry()
  const mdiContext = useNewMDIContextRedux<ItemDataWrapper>(EMPTY_ARRAY)
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
      icon: category.icon ? <IconSuspense iconName={category.icon}/> : <FolderOutlined />,
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
      <Navbar
        ctx={mdiContext}
        menuItems={[{
          key: 'dashboards',
          label: t('Dashboards'),
          icon: <FundOutlined />,
          children: getDashboardMenuItems()
        }]}
        isLoading={loading}
        appPrefix="bi"
        width={300}
      />
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
