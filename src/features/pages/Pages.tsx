import React, {useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {message, Tabs} from 'antd'
import * as icons from '@ant-design/icons'
import {SearchOutlined} from '@ant-design/icons'

import {
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
import Mediator, {Callback, CallbackOperation} from '../../services/mediator'

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

    const handleItemCreate = (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => {
        if (cb) {
            const key = generateKey(item.name, ViewType.view)
            observerKey ? mediator.addObserver(observerKey, key, [cb]) : mediator.addObservable(key, [cb])
            dispatch(openPage({key, item, viewType: ViewType.view, data: initialData}))
        } else {
            dispatch(openPage({item, viewType: ViewType.view}))
        }
    }

    const handleItemView = async (item: Item, id: string, cb?: Callback, observerKey?: string) => {
        const refreshedData = await queryService.findById(item, id)
        if (refreshedData.data) {
            if (cb) {
                const key = generateKey(item.name, ViewType.view, refreshedData.data.id)
                observerKey ? mediator.addObserver(observerKey, key, [cb]) : mediator.addObservable(key, [cb])
            }

            dispatch(openPage({item, viewType: ViewType.view, data: refreshedData.data}))
        } else {
            message.error(t('Item not found. It may have been removed'))
        }
    }

    const handleItemDelete = (itemName: string, id: string) => {
        const key = generateKey(itemName, ViewType.view, id)
        mediator.runObservableCallbacks(key, CallbackOperation.DELETE, id)
        mediator.removeKey(key)
        dispatch(closePage(key))
    }

    const handleUpdate = (data: ItemData) => dispatch(updateActivePage(data))

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
                const title = getLabel(page)
                return (
                    <TabPane
                        key={page.key}
                        tab={Icon ? <span><Icon/>&nbsp;{title}</span> : title}
                        style={{background: '#fff'}}
                    >
                        <div className="page-content">
                            {viewType === ViewType.default ?
                                <DefaultPage
                                    me={me}
                                    page={page}
                                    onItemCreate={handleItemCreate}
                                    onItemView={handleItemView}
                                    onItemDelete={handleItemDelete}
                                /> :
                                <ViewPage
                                    me={me}
                                    page={page}
                                    onItemCreate={handleItemCreate}
                                    onItemView={handleItemView}
                                    onItemDelete={handleItemDelete}
                                    onUpdate={handleUpdate}
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