import React from 'react'
import {DashboardExtra, Item, ItemDataWrapper} from '../types'
import DashboardSpec from './DashboardSpec'
import {DASHBOARD_ITEM_NAME} from '../config/constants'

interface Props {
    data: ItemDataWrapper
    onDashboardOpen: (id: string, extra?: DashboardExtra) => void
}

export default function DashboardSpecReadOnlyWrapper({data: dataWrapper, onDashboardOpen}: Props) {
    return (
        <DashboardSpec
            data={dataWrapper}
            buffer={{}}
            readOnly
            onBufferChange={() => {}}
        />
    )
}