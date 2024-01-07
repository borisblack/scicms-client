import {CustomComponent} from 'src/extensions/custom-components'
import Fields from './Fields'

const COMPONENT_ID = 'datasetFields'

export const datasetFields: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'dataset.tabs.begin',
    priority: 10,
    title: 'Fields',
    icon: 'BarsOutlined',
    render: ({context}) => <Fields key={COMPONENT_ID} {...context}/>
}
