import React, {useEffect} from 'react'
import {Navigate} from 'react-router-dom'
import {Layout} from 'antd'
import {useAuth, useRegistry} from 'src/util/hooks'
import Navbar from 'src/features/registry/Navbar'
import {ItemDataWrapper} from 'src/types'
import MDITabs from 'src/components/mdi-tabs/MDITabs'
import {useNewMDIContext} from 'src/components/mdi-tabs/hooks'
import './App.css'

const {Content} = Layout

function App() {
    const {me, isExpired} = useAuth()
    const {isInitialized, initializeIfNeeded} = useRegistry()
    const mdiContext = useNewMDIContext<ItemDataWrapper>([])

    useEffect(() => {
        if (me) {
            initializeIfNeeded(me)
        }
    }, [me, initializeIfNeeded])

    if (!me || isExpired)
        return <Navigate to="/login"/>

    if (!isInitialized)
        return null

    return (
        <Layout className="App">
            <Navbar ctx={mdiContext}/>
            <Layout>
                <Content className="App-content-wrapper">
                    <div className="App-content">
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

export default App
