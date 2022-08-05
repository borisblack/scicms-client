import _ from 'lodash'
import React, {useCallback, useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Layout, Menu, Spin} from 'antd'
// import {gql, useQuery} from '@apollo/client'
import {ItemType} from 'antd/lib/menu/hooks/useItems'
import * as icons from '@ant-design/icons'

import './Navbar.css'
import logo from '../../logo.svg'
import menuConfig, {MenuItem, SubMenu} from '../../config/menu'
import {useAppDispatch, useAppSelector} from '../../util/hooks'
import {Item, UserInfo} from '../../types'
import {initializeIfNeeded, selectIsInitialized, selectLoading} from './registrySlice'
import {openPage, ViewType} from '../pages/pagesSlice'
import ItemService from '../../services/item'

type Props = {
    collapsed: boolean,
    me: UserInfo
}

const {Sider} = Layout

const Navbar = ({collapsed, me}: Props) => {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const loading = useAppSelector(selectLoading)
    const isInitialized = useAppSelector(selectIsInitialized)
    const itemService = useMemo(() => ItemService.getInstance(), [])
    // const { loading, error, data } = useQuery(ME_QUERY, {errorPolicy: 'all'})

    useEffect(() => {
        dispatch(initializeIfNeeded(me))
    }, [isInitialized, me, dispatch])

    const handleItemClick = useCallback((item: Item) => {
        dispatch(openPage({item, viewType: ViewType.default}))
    }, [dispatch])

    const toAntdMenuItems = useCallback((menuItems: (SubMenu | MenuItem)[]): ItemType[] => menuItems
        .filter(it => !('roles' in it) || _.intersection(it.roles, me.roles).length > 0)
        .filter(it => !('itemName' in it) || itemService.findByName(it.itemName))
        .map(it => {
            if ('children' in it) {
                const Icon = it.icon ? (icons as any)[it.icon] : null
                return {
                    key: it.key,
                    label: it.label,
                    icon: Icon ? <Icon/> : null,
                    children: toAntdMenuItems(it.children)
                }
            } else {
                const item = itemService.findByName(it.itemName) as Item
                const Icon = item.icon ? (icons as any)[item.icon] : null
                return {
                    key: item.id,
                    label: _.upperFirst(item.pluralName),
                    icon: Icon ? <Icon/> : null,
                    onClick: () => handleItemClick(item)
                }
            }
        }), [me.roles, itemService, handleItemClick])

    return (
        <Sider className="Navbar" trigger={null} collapsible collapsed={collapsed} width={250}>
            <div className="Navbar-logo-wrapper">
                <img src={logo} className="Navbar-logo" alt="logo"/>
                {!collapsed && <span className="Navbar-logo-text">{t('Navigational panel')}</span>}
            </div>
            <Spin spinning={loading}>
                <Menu
                    mode="inline"
                    theme="dark"
                    items={toAntdMenuItems(menuConfig.items)}
                />
            </Spin>
        </Sider>
    )
}

export default Navbar