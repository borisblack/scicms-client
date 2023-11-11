import React, {useCallback, useEffect} from 'react'
import {Navigate} from 'react-router-dom'
import {Layout} from 'antd'
import {useAppDispatch, useAppSelector} from '../../util/hooks'
import {logout, selectIsExpired, selectMe} from '../../features/auth/authSlice'
import {
    initializeIfNeeded,
    reset as resetRegistry,
    selectCoreConfig,
    selectIsInitialized,
    selectItems,
    selectItemTemplates,
    selectLocales,
    selectPermissions
} from '../../features/registry/registrySlice'
import {reset as resetNavTabs} from '../../features/nav-tabs/navTabsSlice'
import Navbar from '../../features/registry/Navbar'
import NavTabs from '../../features/nav-tabs/NavTabs'
import './App.css'
import {CoreConfig} from '../../services/core-config'

const {Content} = Layout

function App() {
    const dispatch = useAppDispatch()
    const me = useAppSelector(selectMe)
    const isExpired = useAppSelector(selectIsExpired)
    const isInitialized = useAppSelector(selectIsInitialized)
    const coreConfig = useAppSelector(selectCoreConfig)
    const itemTemplates = useAppSelector(selectItemTemplates)
    const items = useAppSelector(selectItems)
    const permissions = useAppSelector(selectPermissions)
    const locales = useAppSelector(selectLocales)

    useEffect(() => {
        if (me) {
            dispatch(initializeIfNeeded(me))
        }
    }, [me, dispatch])

    const handleLogout = useCallback(async () => {
        await dispatch(logout())
        await dispatch(resetNavTabs())
        await dispatch(resetRegistry())
    }, [dispatch])

    if (!me || isExpired)
        return <Navigate to="/login"/>

    if (!isInitialized)
        return null

    return (
        <Layout className="App">
            <Navbar me={me} onLogout={handleLogout}/>
            <Layout>
                <Content className="App-content-wrapper">
                    <div className="App-content">
                        <NavTabs
                            me={me}
                            coreConfig={coreConfig as CoreConfig}
                            itemTemplates={itemTemplates}
                            items={items}
                            permissions={permissions}
                            locales={locales}
                            onLogout={handleLogout}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

export default App
