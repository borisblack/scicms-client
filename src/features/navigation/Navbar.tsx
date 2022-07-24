import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Layout, Menu, Spin} from 'antd'
import {QuestionCircleOutlined} from '@ant-design/icons'

import config from '../../config'
import './Navbar.css'
import logo from '../../logo.svg'
// import {gql} from '@apollo/client'
import {ClassMenu, fetchListOfMenuRelationship, MenuRelationship, selectLoading, selectMenus} from './navigationSlice'
// import {RELATIONSHIPS_KEY} from '../../item/item'
// import {FlatItem} from '../../item/item-util'
// import * as _ from '../../item/item-util'
// import {openPage} from '../pages/pagesSlice'

type Props = {
    collapsed: boolean,
}

const {Sider} = Layout
const {Item: MenuItem, SubMenu} = Menu

const Navbar = ({collapsed}: Props) => {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const loading = useSelector(selectLoading)
    const listOfMenuRelationship = useSelector(selectMenus)
    // const { loading, error, data } = useQuery(USER_QUERY, {errorPolicy: 'all'})

    useEffect(() => {
        dispatch(fetchListOfMenuRelationship())
    }, [dispatch])

    const handleMenuItemClick = (type: string, label: string) => {
        // dispatch(openPage({type, viewType: 'default', label}))
    }

    const renderMenuItems = (listOfClassMenu: ClassMenu[]) => listOfClassMenu.map(classMenu => {
        const classItem = classMenu.source_id
        const {id, name, label_plural} = classItem
        return (
            <MenuItem key={id} onClick={() => handleMenuItemClick(name, label_plural)}>
                {label_plural}
            </MenuItem>
        )
    })

    const renderMenus = (listOfMenuRelationship: MenuRelationship[]) => (
        listOfMenuRelationship.map(menuRelationship => {
            const menu = menuRelationship.target_id
            const listOfClassMenu = menu.listOfClassMenu
            return (
                <SubMenu key={menu.id} title={menu.name}>
                    {renderMenus(menu.listOfMenuRelationship)}
                    {listOfClassMenu && renderMenuItems(listOfClassMenu)}
                </SubMenu>
            )
        })
    )

    return (
        <Sider className="Navbar" trigger={null} collapsible collapsed={collapsed} width={250}>
            <div className="Navbar-logo-wrapper">
                <img src={logo} className="Navbar-logo" alt="logo"/>
                {!collapsed && <span className="Navbar-logo-text">{t('Navigational panel')}</span>}
            </div>
            <Spin spinning={loading}>
            {/*<div>*/}
                {/*<p>Users are loading: {loading ? "yes" : "no"}</p>*/}
                {/*{data && data.queryUser.map((user: any) => <div key={user.username}>{user.username}</div>)}*/}
                {/*<pre>*/}
                {/*                        Bad: {error?.graphQLErrors.map(({ message }, i) => (*/}
                {/*    <span key={i}>{message}</span>*/}
                {/*))}*/}
                {/*                    </pre>*/}
            {/*</div>*/}
                <Menu mode="inline" theme="dark">
                    {renderMenus(listOfMenuRelationship)}
                    <MenuItem key="help">
                        <a href={`${config.backendUrl}/docs/manual.pdf`} target="_blank" rel="noreferrer">
                            <QuestionCircleOutlined/><span>{t('Help')}</span>
                        </a>
                    </MenuItem>
                </Menu>
            </Spin>
        </Sider>
    )
}

export default Navbar