import {useEffect, useRef} from 'react'
import 'diagram-js/assets/diagram-js.css'
import 'bpmn-font/dist/css/bpmn-embedded.css'

import {CustomComponentRenderContext} from '../../index'
import Modeler from '../../../diagram/Modeler'
import customTranslate from '../../../diagram/i18s/custom-translate'
import '../../../diagram/bpmn-js.css'
import styles from './LifecycleSpec.module.css'

const customTranslateModule = {
    translate: [ 'value', customTranslate ]
}

export default function LifecycleSpec({}: CustomComponentRenderContext) {
    const container = useRef<HTMLDivElement>(null)
    const modeler = useRef<Modeler | null>(null)

    useEffect(() => {
        let m: any = modeler.current
        if (!m) {
            m = new Modeler({
                container: container.current,
                additionalModules: [
                    customTranslateModule
                ]
            })
            m.createDiagram()

            modeler.current = m
        }

        // return () => { (m as any).destroy() }
    }, [])

    return (
        <div className={styles.bpmnDiagramWrapper}>
            <div className={styles.bpmnDiagramContainer} ref={container}/>
        </div>
    )
}