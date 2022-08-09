import React, {useCallback} from 'react'
import {Tabs} from 'antd'

import {closePage, getLabel, openPage, selectActiveKey, selectPages, setActiveKey, ViewType} from './pagesSlice'
import {useAppDispatch, useAppSelector} from '../../util/hooks'
import * as icons from '@ant-design/icons'
import {SearchOutlined} from '@ant-design/icons'
import {Item, ItemData, UserInfo} from '../../types'
import DefaultPage from './DefaultPage'
import ViewPage from './ViewPage'

interface Props {
    me: UserInfo,
}

const TabPane = Tabs.TabPane

function Pages({me}: Props) {
    const dispatch = useAppDispatch()
    const pages = useAppSelector(selectPages)
    const activeKey = useAppSelector(selectActiveKey)

    const handleTabsChange = useCallback((activeKey: string) => {
        dispatch(setActiveKey(activeKey))
    }, [dispatch])

    const handleTabsEdit = useCallback((e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        if (action === 'remove')
            dispatch(closePage(e as string))
    }, [dispatch])

    const handleCreate = (item: Item) => {
        dispatch(openPage({item, viewType: ViewType.view}))
    }

    const handleView = (item: Item, data: ItemData) => {
        dispatch(openPage({
            item,
            viewType: ViewType.view,
            data,
        }))
    }

    if (pages.length === 0)
        return null

    return (
        <Tabs
            activeKey={activeKey}
            hideAdd
            type="editable-card"
            className="pages"
            onChange={handleTabsChange}
            onEdit={handleTabsEdit}
        >
            {pages.map(page => {
                const {item, viewType, data} = page
                const Icon = (viewType === ViewType.default) ? SearchOutlined : (item.icon ? (icons as any)[item.icon] : null)
                return (
                    <TabPane
                        key={page.key}
                        tab={<span>{Icon ? <Icon/> : null}{getLabel(item, viewType, data)}</span>}
                        style={{background: '#fff'}}
                    >
                        <div className="page-content">
                            {viewType === ViewType.default ?
                                <DefaultPage
                                    me={me}
                                    page={page}
                                    onCreate={() => handleCreate(page.item)}
                                    onView={data => handleView(page.item, data)}
                                    onDelete={() => {}}
                                /> :
                                <ViewPage
                                    me={me}
                                    page={page}
                                    onUpdate={() => {}}
                                    onDelete={() => {}}
                                />
                            }
                        </div>
                    </TabPane>
                )
            })}
        </Tabs>
    )
}

export default Pages