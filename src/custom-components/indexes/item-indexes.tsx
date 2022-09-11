import {CustomComponent} from '../index'
import Indexes from './Indexes'

const COMPONENT_ID = 'itemIndexes'

export const itemIndexes: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'item.tabs.begin',
    priority: 20,
    title: 'Indexes',
    icon: 'HolderOutlined',
    render: ({context}) => <Indexes key={COMPONENT_ID} {...context}/>
}
