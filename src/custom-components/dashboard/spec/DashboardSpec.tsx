import {useEffect, useMemo} from 'react'
import 'diagram-js/assets/diagram-js.css'
import 'bpmn-font/dist/css/bpmn-embedded.css'

import {CustomComponentRenderContext} from '../../index'
import '../../../diagram/bpmn-js.css'
import {DASHBOARD_ITEM_NAME} from '../../../config/constants'
import PermissionService from '../../../services/permission'
import {DashboardSpec as IDashboardSpec} from '../../../types'

export default function DashboardSpec({me, item, buffer, data}: CustomComponentRenderContext) {
    if (item.name !== DASHBOARD_ITEM_NAME)
        throw new Error('Illegal attribute')

    const isNew = !data?.id
    const isLockedByMe = data?.lockedBy?.data?.id === me.id
    const permissionService = useMemo(() => PermissionService.getInstance(), [])
    const permissions = useMemo(() => {
        const acl = permissionService.getAcl(me, item, data)
        const canEdit = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return [canEdit]
    }, [data, isLockedByMe, isNew, item, me, permissionService])
    const [canEdit] = permissions
    const spec: IDashboardSpec = useMemo(() => buffer.form.spec ?? {...(data?.spec ?? {})}, [buffer.form.spec, data?.spec])

    useEffect(() => {
        //
        buffer.form.spec = spec
    }, [buffer.form, spec])

    return (
        <div></div>
    )
}