import {CustomPlugin} from '.'

export const helloPlugin: CustomPlugin = {
    id: 'helloPlugin',
    pluginPoint: 'itemTemplate.view.footer',
    priority: 10,
    render: ({node, context}) => {
        node.innerHTML = `Hello ${context.item.displayName} from plugin!`
    }
}
