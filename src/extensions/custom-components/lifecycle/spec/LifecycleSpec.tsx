import {useEffect, useRef} from 'react'
import 'diagram-js/assets/diagram-js.css'
import 'bpmn-font/dist/css/bpmn-embedded.css'

import {CustomComponentRenderContext} from '../../index'
import Modeler from '../../../../lib/diagram/Modeler'
import Viewer from '../../../../lib/diagram/Viewer'
import customTranslate from '../../../../lib/diagram/i18s/custom-translate'
import '../../../../lib/diagram/bpmn-js.css'
import styles from './LifecycleSpec.module.css'
import {LIFECYCLE_ITEM_NAME} from '../../../../config/constants'
import {useAcl} from '../../../../util/hooks'

const customTranslateModule = {
    translate: [ 'value', customTranslate ]
}

export default function LifecycleSpec({data: dataWrapper, onBufferChange}: CustomComponentRenderContext) {
    const {item, data} = dataWrapper
    if (item.name !== LIFECYCLE_ITEM_NAME)
        throw new Error('Illegal argument')

    const acl = useAcl(item, data)
    const container = useRef<HTMLDivElement>(null)
    const modeler = useRef<any>(null)

    useEffect(() => {
        const props = {
            container: container.current,
            additionalModules: [customTranslateModule]
        }

        let m: any
        if (acl.canWrite) {
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
    }, [acl.canWrite, data?.spec])

    return (
        <div className={styles.bpmnDiagramWrapper}>
            <div className={styles.bpmnDiagramContainer} ref={container}/>
        </div>
    )
}