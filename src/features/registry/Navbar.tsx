import _ from 'lodash'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Layout, Menu, Spin} from 'antd'
// import {gql, useQuery} from '@apollo/client'
import {ItemType} from 'antd/lib/menu/hooks/useItems'
import './Navbar.css'
import logo from '../../logo.svg'
import menuConfig, {MenuItem, SubMenu} from '../../config/menu'
import {UserInfo} from '../../services/auth'
import {useAppDispatch, useAppSelector} from '../../util/hooks'
import {Item} from '../../types'
import {fetchItemsIfNeeded, ItemCache, selectItems, selectLoading} from './registrySlice'
import {openPage, ViewType} from '../pages/pagesSlice'

type Props = {
    collapsed: boolean,
    me: UserInfo
}

const {Sider} = Layout

const Navbar = ({collapsed, me}: Props) => {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const loading = useAppSelector(selectLoading)
    const items = useAppSelector(selectItems)
    // const { loading, error, data } = useQuery(ME_QUERY, {errorPolicy: 'all'})

    useEffect(() => {
        dispatch(fetchItemsIfNeeded())
    }, [items, dispatch])

    const handleItemClick = (item: Item) => {
        // console.log(`Item [${item.name}] clicked`)
        dispatch(openPage({label: _.upperFirst(item.pluralName), item, viewType: ViewType.default}))
    }

    const toAntdMenuItems = (menuItems: (SubMenu | MenuItem)[]): ItemType[] => menuItems
        .filter(it => !('roles' in it) || _.intersection(it.roles, me.roles).length > 0)
        .filter(it => !('itemName' in it) || (items !== null && items[it.itemName]))
        .map(it => {
            if ('children' in it) {
                return {
                    key: it.key,
                    label: it.label,
                    children: toAntdMenuItems(it.children)
                }
            } else {
                const item = (items as ItemCache)[it.itemName]
                return {
                    key: item.id,
                    label: _.upperFirst(item.pluralName),
                    onClick: () => handleItemClick(item)
                }
            }
        })

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