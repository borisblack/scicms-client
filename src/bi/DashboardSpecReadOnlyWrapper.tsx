import React from 'react'
import {Dashboard, UserInfo} from '../types'
import DashboardSpec from './DashboardSpec'
import ItemService from '../services/item'

interface Props {
    me: UserInfo
    pageKey: string
    dashboard: Dashboard
}

export default function DashboardSpecReadOnlyWrapper({me, pageKey, dashboard}: Props) {
    const itemService = ItemService.getInstance()
    const dashboardItem = itemService.findDashboard()
    if (dashboardItem == null)
        return null

    return (
        <DashboardSpec
            me={me}
            pageKey={pageKey}
            item={dashboardItem}
            buffer={{}}
            data={dashboard}
            readOnly
            onBufferChange={() => {}}
            onItemCreate={() => {}}
            onItemView={() => {}}
            onItemDelete={() => {}}
        />
    )
}