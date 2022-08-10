import React, {useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {message, Tabs} from 'antd'

import {closePage, getLabel, openPage, selectActiveKey, selectPages, setActiveKey, ViewType} from './pagesSlice'
import {useAppDispatch, useAppSelector} from '../../util/hooks'
import * as icons from '@ant-design/icons'
import {SearchOutlined} from '@ant-design/icons'
import {Item, ItemData, UserInfo} from '../../types'
import DefaultPage from './DefaultPage'
import ViewPage from './ViewPage'
import QueryService from '../../services/query'

interface Props {
    me: UserInfo,
}

const TabPane = Tabs.TabPane

function Pages({me}: Props) {
    const dispatch = useAppDispatch()
    const {t} = useTranslation()
    const pages = useAppSelector(selectPages)
    const activeKey = useAppSelector(selectActiveKey)

    const queryService = useMemo(() => QueryService.getInstance(), [])

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

    const handleView = async (item: Item, data: ItemData) => {
        const refreshedData = await queryService.findById(item, data.id)
        if (refreshedData.data) {
            dispatch(openPage({
                item,
                viewType: ViewType.view,
                data: refreshedData.data,
            }))
        } else {
            message.error(t('Item not found. It may have been removed'))
        }
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