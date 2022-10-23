import {CustomComponentRenderContext} from '../../index'
import {DASHBOARD_ITEM_NAME} from '../../../config/constants'
import {useMemo} from 'react'
import {IDashboardSpec} from '../../../types'
import DashboardPanel from '../../../dashboard/DashboardPanel'

const initialSpec: IDashboardSpec = {
    dashes: []
}

export default function DashboardPreview({me, pageKey, item, buffer, data}: CustomComponentRenderContext) {
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal item')

    const spec: IDashboardSpec = useMemo(() => buffer.form.spec ?? {...(data?.spec ?? initialSpec)}, [buffer.form.spec, data?.spec])

    return <DashboardPanel me={me} pageKey={pageKey} spec={spec}/>
}