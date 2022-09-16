import {CustomComponent} from '../../index'
import LifecycleSpec from './LifecycleSpec'

const COMPONENT_ID = 'lifecycleSpec'

export const lifecycleSpec: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'lifecycle.tabs.end',
    priority: 10,
    title: 'Spec',
    icon: 'PartitionOutlined',
    render: ({context}) => <LifecycleSpec key={COMPONENT_ID} {...context}/>
}