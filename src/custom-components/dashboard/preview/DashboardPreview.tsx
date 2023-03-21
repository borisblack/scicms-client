import {CustomComponentRenderContext} from '../../index'
import {DASHBOARD_ITEM_NAME} from '../../../config/constants'
import {useMemo} from 'react'
import {IDashboardSpec} from '../../../types'
import DashboardPanel from '../../../dashboard/DashboardPanel'

const initialSpec: IDashboardSpec = {
    dashes: []
}

export default function DashboardPreview({me, pageKey, item, data, buffer}: CustomComponentRenderContext) {
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal item')

    const spec: IDashboardSpec = useMemo(() => buffer.spec ?? data?.spec ?? initialSpec, [buffer.spec, data?.spec])

    return <DashboardPanel me={me} pageKey={pageKey} spec={spec}/>
}