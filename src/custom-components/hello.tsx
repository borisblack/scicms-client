import {CustomComponent} from '../config/custom-component'

const COMPONENT_ID = 'helloComponent'

export const helloComponent: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'item.view.header',
    priority: 10,
    render: ({context}) => <div key={COMPONENT_ID}>{`Hello ${context.item.displayName} from component!`}</div>
}
