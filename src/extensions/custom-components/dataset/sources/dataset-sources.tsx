import {CustomComponent} from '../../index'
import Sources from './Sources'

const COMPONENT_ID = 'datasetSources'

export const datasetSources: CustomComponent = {
  id: COMPONENT_ID,
  mountPoint: 'dataset.tabs.begin',
  priority: 10,
  title: 'Sources',
  icon: 'TableOutlined',
  render: ({context}) => <Sources key={COMPONENT_ID} {...context}/>
}
