import {CustomComponent} from '.'

const COMPONENT_ID = 'hiComponent'

export const hiComponent: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'item.view.footer',
    priority: 10,
    title: 'Hi',
    icon: 'MehOutlined',
    render: ({context}) => <div key={COMPONENT_ID}>{`Hi ${context.item.displayName} from component!`}</div>
}