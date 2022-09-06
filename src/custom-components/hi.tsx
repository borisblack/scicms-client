import {CustomComponent} from '.'

const COMPONENT_ID = 'hiComponent'

export const hiComponent: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'group.tabs.end',
    priority: 10,
    title: 'Hi',
    icon: 'MehOutlined',
    render: ({context}) => <div key={COMPONENT_ID}>{`Hi ${context.item.displayName} from component!`}</div>
}
