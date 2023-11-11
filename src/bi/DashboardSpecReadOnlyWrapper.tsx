import React from 'react'
import {Dashboard, DashboardExtra, Item, UserInfo} from '../types'
import DashboardSpec from './DashboardSpec'
import {ItemMap} from '../services/item'
import {DASHBOARD_ITEM_NAME} from '../config/constants'
import {PermissionMap} from '../services/permission'
import {ItemTemplateMap} from '../services/item-template'

interface Props {
    me: UserInfo
    uniqueKey: string
    itemTemplates: ItemTemplateMap
    items: ItemMap
    permissions: PermissionMap
    dashboard: Dashboard
    extra?: DashboardExtra
    onDashboardOpen: (id: string, extra?: DashboardExtra) => void
}

export default function DashboardSpecReadOnlyWrapper({
    me, uniqueKey, itemTemplates, items: itemMap, permissions: permissionMap, dashboard, extra, onDashboardOpen
}: Props) {
    const dashboardItem = itemMap[DASHBOARD_ITEM_NAME]

    function handleDashboardItemView(item: Item, id: string, extra?: DashboardExtra) {
        if (item.name !== DASHBOARD_ITEM_NAME)
            throw new Error(`Only ${DASHBOARD_ITEM_NAME} item supported`)

        onDashboardOpen(id, extra)
    }

    return (
        <DashboardSpec
            me={me}
            uniqueKey={uniqueKey}
            itemTemplates={itemTemplates}
            items={itemMap}
            permissions={permissionMap}
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