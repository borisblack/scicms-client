import {CustomComponent} from '../../index'
import Columns from './Columns'

const COMPONENT_ID = 'datasetColumns'

export const datasetColumns: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'dataset.tabs.begin',
    priority: 10,
    title: 'Columns',
    icon: 'BarsOutlined',
    render: ({context}) => <Columns key={COMPONENT_ID} {...context}/>
}
