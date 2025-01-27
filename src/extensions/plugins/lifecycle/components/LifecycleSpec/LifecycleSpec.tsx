import {useEffect, useRef} from 'react'
import 'diagram-js/assets/diagram-js.css'
import 'bpmn-font/dist/css/bpmn-embedded.css'

import Modeler from 'src/lib/diagram/Modeler'
import Viewer from 'src/lib/diagram/Viewer'
import {CustomComponentContext} from 'src/extensions/plugins/types'
import customTranslate from 'src/lib/diagram/i18s/custom-translate'
import {LIFECYCLE_ITEM_NAME} from 'src/config/constants'
import {useAcl} from 'src/util/hooks'
import 'src/lib/diagram/bpmn-js.css'
import styles from './LifecycleSpec.module.css'

const customTranslateModule = {
  translate: ['value', customTranslate]
}

export default function LifecycleSpec({data: dataWrapper, onBufferChange}: CustomComponentContext) {
  const {item, data} = dataWrapper
  if (item.name !== LIFECYCLE_ITEM_NAME) throw new Error('Illegal argument')

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
        m.saveXML({format: true}).then((xml: any) => {
          onBufferChange({spec: xml.xml})
        })
      })
    } else {
      m = new Viewer(props)
    }

    if (data?.spec) m.importXML(data.spec)
    else m.createDiagram()

    modeler.current = m

    return () => {
      m.destroy()
      m = null
      modeler.current = null
    }
  }, [acl.canWrite, data?.spec])

  return (
    <div className={styles.bpmnDiagramWrapper}>
      <div className={styles.bpmnDiagramContainer} ref={container} />
    </div>
  )
}
