import {CustomPlugin} from '.'

export const hiPlugin: CustomPlugin = {
    id: 'hiPlugin',
    pluginPoint: 'item.view.footer',
    priority: 10,
    render: ({node, context}) => {
        node.innerHTML = `Hi ${context.item.displayName} from plugin!`
    }
}
