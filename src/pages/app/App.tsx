import {ReactNode, useEffect} from 'react'
import {Navigate} from 'react-router-dom'
import {Layout} from 'antd'

import {useAuth, useRegistry} from 'src/util/hooks'
import Navbar from 'src/features/registry/Navbar'
import {ViewType} from 'src/types'
import {ItemDataWrapper} from 'src/types/schema'
import MDITabs from 'src/components/MDITabs'
import ViewNavTab from './ViewNavTab'
import DefaultNavTab from './DefaultNavTab'
import {generateLabel} from 'src/util/mdi'
import menuConfig from 'src/config/menu'
import {useNewMDIContextRedux} from 'src/features/mdi/hooks'
import {EMPTY_ARRAY} from 'src/config/constants'
import {toAntdMenuItems} from 'src/features/registry/util'
import './App.css'

const {Content} = Layout

function App() {
  const {me, isExpired} = useAuth()
  const {isInitialized, initializeIfNeeded, items} = useRegistry()
  const mdiContext = useNewMDIContextRedux<ItemDataWrapper>(EMPTY_ARRAY)

  useEffect(() => {
    if (me) {
      initializeIfNeeded(me)
    }
  }, [me, initializeIfNeeded])

  const renderItem = (data: ItemDataWrapper): ReactNode =>
    data.viewType === ViewType.view ? (
      <ViewNavTab data={data}/>
    ) : (
      <DefaultNavTab data={data}/>
    )

  if (!me || isExpired)
    return <Navigate to="/login?targetUrl=/"/>

  if (!isInitialized)
    return null

  return (
    <Layout className="App">
      <Navbar
        ctx={mdiContext}
        menuItems={toAntdMenuItems({
          me,
          ctx: mdiContext,
          items,
          menuItems: menuConfig.items
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
