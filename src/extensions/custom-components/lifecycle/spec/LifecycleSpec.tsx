import {useEffect, useMemo, useRef} from 'react'
import 'diagram-js/assets/diagram-js.css'
import 'bpmn-font/dist/css/bpmn-embedded.css'

import {CustomComponentRenderContext} from '../../index'
import Modeler from '../../../../diagram/Modeler'
import Viewer from '../../../../diagram/Viewer'
import customTranslate from '../../../../diagram/i18s/custom-translate'
import '../../../../diagram/bpmn-js.css'
import styles from './LifecycleSpec.module.css'
import {LIFECYCLE_ITEM_NAME} from '../../../../config/constants'
import * as PermissionService from '../../../../services/permission'

const customTranslateModule = {
    translate: [ 'value', customTranslate ]
}

export default function LifecycleSpec({me, permissions: permissionMap, item, data, onBufferChange}: CustomComponentRenderContext) {
    if (item.name !== LIFECYCLE_ITEM_NAME)
        throw new Error('Illegal argument')

    const isNew = !data?.id
    const isLockedByMe = data?.lockedBy?.data?.id === me.id
    const permissions = useMemo(() => {
        const acl = PermissionService.getAcl(permissionMap, me, item, data)
        const canEdit = (isNew && acl.canCreate) || (isLockedByMe && acl.canWrite)
        return [canEdit]
    }, [data, isLockedByMe, isNew, item, me, permissionMap])

    const [canEdit] = permissions
    const container = useRef<HTMLDivElement>(null)
    const modeler = useRef<any>(null)

    useEffect(() => {
        const props = {
            container: container.current,
            additionalModules: [customTranslateModule]
        }

        let m: any
        if (canEdit) {
            m = new Modeler(props)
            const eventBus = m.get('eventBus')
            eventBus.on('elements.changed', (context: any) => {
                m.saveXML({format: true})
                    .then((xml: any) => {
                        onBufferChange({spec: xml.xml})
                    })
            })
        } else {
            m = new Viewer(props)
        }

        if (data?.spec)
            m.importXML(data.spec)
        else
            m.createDiagram()

        modeler.current = m

        return () => {
            m.destroy()
            m = null
            modeler.current = null
        }
    }, [canEdit, data?.spec, onBufferChange])

    return (
        <div className={styles.bpmnDiagramWrapper}>
            <div className={styles.bpmnDiagramContainer} ref={container}/>
        </div>
    )
}