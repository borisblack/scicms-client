import {CustomPlugin} from '.'

export const helloPlugin: CustomPlugin = {
    id: 'helloPlugin',
    pluginPoint: 'item.view.header',
    priority: 10,
    title: 'Hello',
    icon: 'SmileOutlined',
    render: ({node, context}) => {
        node.innerHTML = `Hello ${context.item.displayName} from plugin!`
    }
}
