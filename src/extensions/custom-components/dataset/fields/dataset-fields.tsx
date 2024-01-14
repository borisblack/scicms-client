import {CustomComponent} from 'src/extensions/custom-components'
import DatasetFields from './DatasetFields'

const COMPONENT_ID = 'datasetFields'

export const datasetFields: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'dataset.tabs.begin',
    priority: 10,
    title: 'Fields',
    icon: 'BarsOutlined',
    render: ({context}) => <DatasetFields key={COMPONENT_ID} {...context}/>
}
