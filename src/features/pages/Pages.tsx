import React, {useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {message, Tabs} from 'antd'
import * as icons from '@ant-design/icons'
import {SearchOutlined} from '@ant-design/icons'

import {
    closeActivePage,
    closePage,
    generateKey,
    getLabel,
    openPage,
    selectActiveKey,
    selectPages,
    setActiveKey,
    updateActivePage,
    ViewType
} from './pagesSlice'
import {useAppDispatch, useAppSelector} from '../../util/hooks'
import {Item, ItemData, UserInfo} from '../../types'
import DefaultPage from './DefaultPage'
import ViewPage from './ViewPage'
import QueryService from '../../services/query'
import Mediator from '../../services/mediator'

interface Props {
    me: UserInfo,
}

const TabPane = Tabs.TabPane
const mediator = Mediator.getInstance()

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

    const handleCreate = (item: Item, cb?: () => void, observerKey?: string) => {
        if (cb) {
            // Add observer/observable here because callbacks aren't serializable
            const key = generateKey(item.name, ViewType.view)
            observerKey ? mediator.addObserver(observerKey, key, [cb]) : mediator.addObservable(key, [cb])
            dispatch(openPage({key, item, viewType: ViewType.view}))
        } else {
            dispatch(openPage({item, viewType: ViewType.view}))
        }
    }

    const handleItemView = async (item: Item, id: string, cb?: () => void, observerKey?: string) => {
        const refreshedData = await queryService.findById(item, id)
        if (refreshedData.data) {
            if (cb) {
                // Add observer/observable here because callbacks aren't serializable
                const key = generateKey(item.name, ViewType.view, refreshedData.data.id)
                observerKey ? mediator.addObserver(observerKey, key, [cb]) : mediator.addObservable(key, [cb])
            }

            dispatch(openPage({item, viewType: ViewType.view, data: refreshedData.data}))
        } else {
            message.error(t('Item not found. It may have been removed'))
        }
    }

    const handleUpdate = (data: ItemData) => dispatch(updateActivePage(data))

    const handleClose = () => dispatch(closeActivePage())

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
                const {item, viewType} = page
                const Icon = (viewType === ViewType.default) ? SearchOutlined : (item.icon ? (icons as any)[item.icon] : null)
                return (
                    <TabPane
                        key={page.key}
                        tab={<span>{Icon ? <Icon/> : null}{getLabel(page)}</span>}
                        style={{background: '#fff'}}
                    >
                        <div className="page-content">
                            {viewType === ViewType.default ?
                                <DefaultPage
                                    me={me}
                                    page={page}
                                    onItemView={handleItemView}
                                    onCreate={(cb?: () => void, observerKey?: string) => handleCreate(page.item, cb, observerKey)}
                                    onDelete={() => {}}
                                /> :
                                <ViewPage
                                    me={me}
                                    page={page}
                                    onItemView={handleItemView}
                                    onUpdate={handleUpdate}
                                    onDelete={handleClose}
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