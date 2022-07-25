import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Layout, Menu, Spin} from 'antd'
import {ItemType} from 'antd/lib/menu/hooks/useItems'
import './Navbar.css'
import logo from '../../logo.svg'
// import {gql} from '@apollo/client'
import {fetchItems, selectItems, selectLoading} from './navigationSlice'
import menuConfig from '../../config/menu'
// import {openPage} from '../pages/pagesSlice'

type Props = {
    collapsed: boolean,
}

const {Sider} = Layout

const Navbar = ({collapsed}: Props) => {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const loading = useSelector(selectLoading)
    const items = useSelector(selectItems)
    // const { loading, error, data } = useQuery(USER_QUERY, {errorPolicy: 'all'})

    useEffect(() => {
        dispatch(fetchItems())
    }, [items, dispatch])

    const handleItemClick = (id: string, name: string, pluralName: string) => {
        console.log(`Item ${name} clicked`)
        // dispatch(openPage({type, viewType: 'default', label}))
    }

    const getCategoriesAndItems = (parent: string | null): ItemType[] => {
        const categoriesAndItems: ItemType[] = menuConfig.categories
            .filter(cat => cat.categories.has(parent))
            .map(cat => ({
                key: cat.name,
                label: cat.displayName,
                children: getCategoriesAndItems(cat.name)
            }))

        categoriesAndItems.push(...getItemsOnly(parent))

        return categoriesAndItems
    }

    const getItemsOnly = (parent: string | null): ItemType[] => menuConfig.items
        .filter(it => it.categories.has(parent))
        .map(it => {
            const item = findItemByName(it.name)
            if (!item)
                throw new Error('Item not found')

            return {
                key: item.id,
                label: item.description,
                onClick: () => handleItemClick(item.id, item.name, item.description)
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
                    items={items.length === 0 ? [] : getCategoriesAndItems(null)}
                />
            </Spin>
        </Sider>
    )
}

export default Navbar