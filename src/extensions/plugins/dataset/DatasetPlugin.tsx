import {Plugin} from '../Plugin'
import {DatasetFields, Sources} from './components'

const DATASET_SOURCES_COMPONENT_ID = 'datasetSources'
const DATASET_FIELDS_COMPONENT_ID = 'datasetFields'

export class DatasetPlugin extends Plugin {
  override onLoad() {
    this.addComponent({
      id: DATASET_SOURCES_COMPONENT_ID,
      mountPoint: 'dataset.tabs.begin',
      priority: 10,
      title: 'Sources',
      icon: 'TableOutlined',
      render: ({context}) => <Sources key={DATASET_SOURCES_COMPONENT_ID} {...context} />
    })

    this.addComponent({
      id: DATASET_FIELDS_COMPONENT_ID,
      mountPoint: 'dataset.tabs.begin',
      priority: 20,
      title: 'Fields',
      icon: 'BarsOutlined',
      render: ({context}) => <DatasetFields key={DATASET_FIELDS_COMPONENT_ID} {...context} />
    })
  }

  override onUnload() {
    throw new Error('Method not implemented.')
  }
}
