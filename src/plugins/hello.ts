import {CustomPlugin} from '../config/plugin'

export const helloPlugin: CustomPlugin = {
    id: 'helloPlugin',
    pluginPoint: 'item.view.header',
    priority: 10,
    render: ({node, context}) => {
        node.innerHTML = `Hello ${context.item.displayName}!`
    }
}
