import {Plugin} from '../Plugin'
import {LifecycleSpecSuspense} from './components'

const LIFECYCLE_SPEC_COMPONENT_ID = 'lifecycleSpec'

export class LifecyclePlugin extends Plugin {
  override onLoad() {
    this.addComponent({
      id: LIFECYCLE_SPEC_COMPONENT_ID,
      mountPoint: 'lifecycle.tabs.end',
      priority: 10,
      title: 'Spec',
      icon: 'PartitionOutlined',
      render: ({context}) => <LifecycleSpecSuspense key={LIFECYCLE_SPEC_COMPONENT_ID} {...context} />
    })
  }

  override onUnload() {
    throw new Error('Method not implemented.')
  }
}
