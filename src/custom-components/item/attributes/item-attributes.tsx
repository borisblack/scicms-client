import {CustomComponent} from '../../.'
import Attributes from './Attributes'

const COMPONENT_ID = 'itemAttributes'

export const itemAttributes: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'item.tabs.begin',
    priority: 10,
    title: 'Attributes',
    icon: 'BarsOutlined',
    render: ({context}) => <Attributes key={COMPONENT_ID} {...context}/>
}
