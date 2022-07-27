import _ from 'lodash'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Layout, Menu, Spin} from 'antd'

import {ItemType} from 'antd/lib/menu/hooks/useItems'
import './Navbar.css'
import logo from '../../logo.svg'
// import {gql} from '@apollo/client'
import {fetchItems, selectItems, selectLoading} from './navigationSlice'
import menuConfig, {MenuItem, SubMenu} from '../../config/menu'
import {MeInfo} from '../../services/auth'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {Item} from '../../types'
import {openPage, ViewType} from '../pages/pagesSlice'
import {capitalizeFirstLetter} from '../../util'

type Props = {
    collapsed: boolean,
    me: MeInfo
}

const {Sider} = Layout

const Navbar = ({collapsed, me}: Props) => {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const loading = useAppSelector(selectLoading)
    const items = useAppSelector(selectItems)
    // const { loading, error, data } = useQuery(USER_QUERY, {errorPolicy: 'all'})

    useEffect(() => {
        dispatch(fetchItems())
    }, [items, dispatch])

    const handleItemClick = (item: Item) => {
        // console.log(`Item [${item.name}] clicked`)
        dispatch(openPage({label: capitalizeFirstLetter(item.pluralName), item, viewType: ViewType.default}))
    }

    const toAntdMenuItems = (menuItems: (SubMenu | MenuItem)[]): ItemType[] => menuItems
        .filter(it => !('roles' in it) || _.intersection(it.roles, me.roles).length > 0)
        .filter(it => !('itemName' in it) || findItemByName(it.itemName))
        .map(it => {
            if ('children' in it) {
                return {
                    key: it.key,
                    label: it.label,
                    children: toAntdMenuItems(it.children)
                }
            } else {
                const item = findItemByName(it.itemName) as Item
                return {
                    key: item.id,
                    label: capitalizeFirstLetter(item.pluralName),
                    onClick: () => handleItemClick(item)
                }
            }
        })

    const findItemByName = (name: string) => items.find(it => it.name === name)

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