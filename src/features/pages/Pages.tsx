import React, {useCallback, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {message, Tabs} from 'antd'
import {SearchOutlined} from '@ant-design/icons'
import {Tab} from 'rc-tabs/lib/interface'

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
import {allIcons} from '../../util/icons'
import styles from './Pages.module.css'

interface Props {
    me: UserInfo,
    onLogout: () => void
}

const mediator = Mediator.getInstance()

function Pages({me, onLogout}: Props) {
    const dispatch = useAppDispatch()
    const {t} = useTranslation()
    const pages = useAppSelector(selectPages)
    const activeKey = useAppSelector(selectActiveKey)

    const queryService = useMemo(() => QueryService.getInstance(), [])

    const handleTabsChange = useCallback((activeKey: string) => {
        dispatch(setActiveKey(activeKey))
    }, [dispatch])

    const closeTab = useCallback((key: string) => {
        mediator.removeKey(key)
        dispatch(closePage(key))
    }, [dispatch])

    const handleTabsEdit = useCallback((e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        if (action === 'remove')
            closeTab(e as string)
    }, [closeTab])

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
        closeTab(key)
    }

    const handleUpdate = (data: ItemData) => dispatch(updateActivePage(data))

    const getTabs = (): Tab[] => pages.map(page => {
        const {item, viewType} = page
        const Icon = (viewType === ViewType.default) ? SearchOutlined : (item.icon ? allIcons[item.icon] : null)
        const title = getLabel(page)
        return {
            key: page.key,
            label: Icon ? <span><Icon/>{title}</span> : title,
            style: {background: '#fff'},
            children: (
                <div className={styles.pageContent}>
                    {viewType === ViewType.default ?
                        <DefaultPage
                            me={me}
                            page={page}
                            onItemCreate={handleItemCreate}
                            onItemView={handleItemView}
                            onItemDelete={handleItemDelete}
                            onLogout={onLogout}
                        /> :
                        <ViewPage
                            me={me}
                            page={page}
                            closePage={() => closeTab(page.key)}
                            onItemCreate={handleItemCreate}
                            onItemView={handleItemView}
                            onItemDelete={handleItemDelete}
                            onUpdate={handleUpdate}
                            onLogout={onLogout}
                        />
                    }
                </div>
            )
        }
    })

    if (pages.length === 0)
        return null

    return (
        <Tabs
            activeKey={activeKey}
            hideAdd
            type="editable-card"
            className="pages"
            items={getTabs()}
            onChange={handleTabsChange}
            onEdit={handleTabsEdit}
        />
    )
}

export default Pages