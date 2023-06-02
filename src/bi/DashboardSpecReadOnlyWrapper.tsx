import React from 'react'
import {Dashboard, DashboardExtra, Item, UserInfo} from '../types'
import DashboardSpec from './DashboardSpec'
import ItemService from '../services/item'
import {DASHBOARD_ITEM_NAME} from '../config/constants'

interface Props {
    me: UserInfo
    pageKey: string
    dashboard: Dashboard
    extra?: DashboardExtra
    onDashboardOpen: (id: string, extra?: DashboardExtra) => void
}

export default function DashboardSpecReadOnlyWrapper({me, pageKey, dashboard, extra, onDashboardOpen}: Props) {
    const itemService = ItemService.getInstance()
    const dashboardItem = itemService.getDashboard()

    function handleDashboardItemView(item: Item, id: string, extra?: DashboardExtra) {
        if (item.name !== DASHBOARD_ITEM_NAME)
            throw new Error(`Only ${DASHBOARD_ITEM_NAME} item supported`)

        onDashboardOpen(id, extra)
    }

    return (
        <DashboardSpec
            me={me}
            pageKey={pageKey}
            item={dashboardItem}
            buffer={{}}
            data={dashboard}
            extra={extra}
            readOnly
            onBufferChange={() => {}}
            onItemCreate={() => {}}
            onItemView={handleDashboardItemView}
            onItemDelete={() => {}}
        />
    )
}