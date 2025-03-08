import {ReactNode, useEffect} from 'react'
import {Navigate} from 'react-router-dom'
import {Layout} from 'antd'

import {useAuth, useMenuProperties, useRegistry} from 'src/util/hooks'
import Navbar from 'src/features/registry/Navbar'
import {ViewType} from 'src/types'
import {ItemTab} from 'src/types/schema'
import MDITabs from 'src/uiKit/MDITabs'
import ViewNavTab from './ViewNavTab'
import DefaultNavTab from './DefaultNavTab'
import {generateLabel} from 'src/util/mdi'
import {useNewMDIContextRedux} from 'src/features/mdi/hooks'
import {EMPTY_ARRAY} from 'src/config/constants'
import {toAntdMenuItems} from 'src/features/registry/util'
import './App.css'

const {Content} = Layout

function App() {
  const {me, isExpired} = useAuth()
  const {isInitialized, initializeIfNeeded, items} = useRegistry()
  const mdiContext = useNewMDIContextRedux<ItemTab>(EMPTY_ARRAY)
  const menuItems = useMenuProperties().items

  useEffect(() => {
    if (me) {
      initializeIfNeeded(me)
    }
  }, [me, initializeIfNeeded])

  const renderItem = (itemTab: ItemTab): ReactNode =>
    itemTab.viewType === ViewType.view ? <ViewNavTab itemTab={itemTab} /> : <DefaultNavTab itemTab={itemTab} />

  if (!me || isExpired) return <Navigate to="/login?targetUrl=/" />

  if (!isInitialized) return null

  return (
    <Layout className="App">
      <Navbar
        ctx={mdiContext}
        menuItems={toAntdMenuItems({
          me,
          ctx: mdiContext,
          items,
          menuItems
        })}
      />
      <Layout>
        <Content className="App-content-wrapper">
          <div className="App-content">
            <MDITabs
              ctx={mdiContext}
              className="pages"
              type="editable-card"
              getItemLabel={generateLabel}
              renderItem={renderItem}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
