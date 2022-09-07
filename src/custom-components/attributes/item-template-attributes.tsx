import {CustomComponent} from '../index'
import Attributes from './Attributes'

const COMPONENT_ID = 'itemTemplateAttributes'

export const itemTemplateAttributes: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'itemTemplate.tabs.begin',
    priority: 10,
    title: 'Attributes',
    icon: 'BarsOutlined',
    render: ({context}) => <Attributes key={COMPONENT_ID} {...context}/>
}
