import {CustomComponent} from '.'

const COMPONENT_ID = 'helloComponent'

export const helloComponent: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'item.view.footer',
    priority: 10,
    title: 'Hello',
    icon: 'SmileOutlined',
    render: ({context}) => <div key={COMPONENT_ID}>{`Hello ${context.item.displayName} from component!`}</div>
}
