import React from 'react'
import {Tabs} from 'antd'

import {closePage, selectActiveKey, selectPages, setActiveKey} from './pagesSlice'
import Page from './Page'
import {useAppDispatch, useAppSelector} from '../../util/hooks'

const TabPane = Tabs.TabPane

function Pages() {
    const dispatch = useAppDispatch()
    const pages = useAppSelector(selectPages)
    const activeKey = useAppSelector(selectActiveKey)

    function handleTabsChange(activeKey: string) {
        dispatch(setActiveKey(activeKey))
    }

    const handleTabsEdit = (e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        if (action === 'remove')
            dispatch(closePage(e as string))
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
            {pages.map(page => (
                <TabPane key={page.key} tab={page.label} style={{background: '#fff'}}>
                    <Page page={page}/>
                </TabPane>
            ))}
        </Tabs>
    )
}

export default Pages