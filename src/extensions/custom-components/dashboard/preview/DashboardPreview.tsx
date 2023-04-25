import {CustomComponentRenderContext} from '../../index'
import {DASHBOARD_ITEM_NAME} from '../../../../config/constants'
import {useMemo} from 'react'
import {Dashboard, IDashboardSpec} from '../../../../types'
import DashboardPanel from '../../../../bi/DashboardPanel'

const initialSpec: IDashboardSpec = {
    dashes: []
}

export default function DashboardPreview({me, pageKey, item, data, buffer}: CustomComponentRenderContext) {
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal item')

    // const spec: IDashboardSpec = useMemo(() => data?.spec ?? initialSpec, [data?.spec]) // update only by save
    const spec: IDashboardSpec = useMemo(() => buffer.spec ?? data?.spec ?? initialSpec, [buffer.spec, data?.spec])
    const dashboard = {...data, spec} as Dashboard

    return <DashboardPanel me={me} pageKey={pageKey} dashboard={dashboard}/>
}