import {CustomComponent} from '../../index'
import LifecycleSpecSuspense from './LifecycleSpecSuspense'

const COMPONENT_ID = 'lifecycleSpec'

export const lifecycleSpec: CustomComponent = {
  id: COMPONENT_ID,
  mountPoint: 'lifecycle.tabs.end',
  priority: 10,
  title: 'Spec',
  icon: 'PartitionOutlined',
  render: ({context}) => <LifecycleSpecSuspense key={COMPONENT_ID} {...context}/>
}