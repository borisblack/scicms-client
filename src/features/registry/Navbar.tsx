import _ from 'lodash'
import React, {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Layout, Menu, Spin} from 'antd'
// import {gql, useQuery} from '@apollo/client'
import {ItemType} from 'antd/lib/menu/hooks/useItems'

import './Navbar.css'
import logo from '../../logo.svg'
import menuConfig, {MenuItem, SubMenu} from '../../config/menu'
import {useAppDispatch, useAppSelector, useMe} from '../../util/hooks'
import {Item} from '../../types'
import {selectItems, selectLoading} from './registrySlice'
import {openNavTab, ViewType} from '../nav-tabs/navTabsSlice'
import {allIcons} from '../../util/icons'
import {LogoutOutlined, UserOutlined} from '@ant-design/icons'

type Props = {
    onLogout: () => void
}

const {Sider} = Layout

const isNavbarCollapsed = () => localStorage.getItem('navbarCollapsed') === '1'

const setNavbarCollapsed = (collapsed: boolean) => localStorage.setItem('navbarCollapsed', collapsed ? '1' : '0')

const Navbar = ({onLogout}: Props) => {
    const me = useMe()
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const loading = useAppSelector(selectLoading)
    const items = useAppSelector(selectItems)
    const [collapsed, setCollapsed] = useState(isNavbarCollapsed())
    // const { loading, error, data } = useQuery(ME_QUERY, {errorPolicy: 'all'})

    const handleToggle = useCallback(() => {
        setNavbarCollapsed(!collapsed)
        setCollapsed(!collapsed)
    }, [collapsed])

    const handleItemClick = useCallback((item: Item) => {
        dispatch(openNavTab({item, viewType: ViewType.default}))
    }, [dispatch])

    const toAntdMenuItems = useCallback((menuItems: (SubMenu | MenuItem)[]): ItemType[] => menuItems
        .filter(it => !('roles' in it) || _.intersection(it.roles, me?.roles).length > 0)
        .filter(it => !('itemName' in it) || items[it.itemName])
        .map(it => {
            if ('children' in it) {
                const Icon = it.icon ? allIcons[it.icon] : null
                return {
                    key: it.key,
                    label: t(it.label),
                    icon: Icon ? <Icon/> : null,
                    children: toAntdMenuItems(it.children)
                }
            } else {
                const item = items[it.itemName]
                const Icon = item.icon ? allIcons[item.icon] : null
                return {
                    key: item.id,
                    label: t(item.displayPluralName),
                    icon: Icon ? <Icon/> : null,
                    onClick: () => handleItemClick(item)
                }
            }
        }), [me?.roles, items, t, handleItemClick])

    return (
        <Sider className="Navbar" collapsible collapsed={collapsed} width={275} onCollapse={handleToggle}>
            <div className="Navbar-logo-wrapper">
                <img src={logo} className="Navbar-logo" alt="logo"/>
                {!collapsed && <span className="Navbar-logo-text">{t('SciCMS Admin')}</span>}
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
                                onClick: onLogout
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