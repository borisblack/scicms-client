import {CustomComponent} from '../../index'
import Indexes from './Indexes'

const COMPONENT_ID = 'itemTemplateIndexes'

export const itemTemplateIndexes: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'itemTemplate.tabs.begin',
    priority: 20,
    title: 'Indexes',
    icon: 'HolderOutlined',
    render: ({context}) => <Indexes key={COMPONENT_ID} {...context}/>
}
