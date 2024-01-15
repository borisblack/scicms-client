import _ from 'lodash'
import React, {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Layout, Menu, Spin} from 'antd'
import {LogoutOutlined, UserOutlined} from '@ant-design/icons'
// import {gql, useQuery} from '@apollo/client'
import {ItemType} from 'antd/lib/menu/hooks/useItems'

import menuConfig, {MenuItem, SubMenu} from 'src/config/menu'
import {useAuth, useRegistry} from 'src/util/hooks'
import {ViewType} from 'src/types'
import {Item, ItemDataWrapper} from 'src/types/schema'
import {createMDITab} from 'src/util/mdi'
import {MDIContext} from 'src/components/MDITabs'
import IconSuspense from 'src/components/icons/IconSuspense'
import logo from 'src/logo.svg'
import styles from './Navbar.module.css'

type Props = {
    ctx: MDIContext<ItemDataWrapper>
}

const {Sider} = Layout

const isNavbarCollapsed = () => localStorage.getItem('navbarCollapsed') === '1'

const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('navbarCollapsed', collapsed ? '1' : '0')

const Navbar = ({ctx}: Props) => {
    const {me, logout} = useAuth()
    const {items, loading, reset: resetRegistry} = useRegistry()
    const {t} = useTranslation()
    const [collapsed, setCollapsed] = useState(isNavbarCollapsed())
    // const { loading, error, data } = useQuery(ME_QUERY, {errorPolicy: 'all'})

    const handleLogout = useCallback(async () => {
        await logout()
        ctx.reset()
        resetRegistry()
    }, [ctx, logout, resetRegistry])

    const handleToggle = useCallback(() => {
        setNavbarCollapsed(!collapsed)
        setCollapsed(!collapsed)
    }, [collapsed])

    const handleItemClick = useCallback((item: Item) => {
        ctx.openTab(
            createMDITab(
                item,
                ViewType.default
            )
        )
    }, [ctx])

    const toAntdMenuItems = useCallback((menuItems: (SubMenu | MenuItem)[]): ItemType[] => menuItems
        .filter(it => !('roles' in it) || _.intersection(it.roles, me?.roles).length > 0)
        .filter(it => !('itemName' in it) || items[it.itemName])
        .map(it => {
            if ('children' in it) {
                return {
                    key: it.key,
                    label: t(it.label),
                    icon: <span><IconSuspense iconName={it.icon}/></span>,
                    children: toAntdMenuItems(it.children)
                }
            } else {
                const item = items[it.itemName]
                return {
                    key: item.id,
                    label: t(item.displayPluralName),
                    icon: <span><IconSuspense iconName={item.icon}/></span>,
                    onClick: () => handleItemClick(item)
                }
            }
        }), [me?.roles, items, t, handleItemClick])

    return (
        <Sider
            className={styles.navbarSider}
            collapsible
            collapsed={collapsed}
            trigger={null}
            width={275}
            onCollapse={handleToggle}
        >
            <div className={styles.navbarLogoWrapper} onClick={handleToggle}>
                <img src={logo} className={styles.navbarLogo} alt="logo"/>
                {!collapsed && <span className={styles.navbarLogoText}>{t('SciCMS Admin')}</span>}
            </div>
            <Spin spinning={loading}>
                <Menu
                    mode="inline"
                    theme="dark"
                    items={[{
                            key: 'profile',
                            label: `${t('Profile')} (${me?.username ?? 'Anonymous'})`,
                            icon: <UserOutlined />,
                            children: !!me ? [{
                                key: 'logout',
                                label: t('Logout'),
                                icon: <LogoutOutlined/>,
                                onClick: handleLogout
                            }] : []
                        },
                        ...toAntdMenuItems(menuConfig.items)
                    ]}
                />
            </Spin>
        </Sider>
    )
}

export default Navbar