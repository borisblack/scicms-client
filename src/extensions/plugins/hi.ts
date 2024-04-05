import {CustomPlugin} from './index'

export const hiPlugin: CustomPlugin = {
  id: 'hiPlugin',
  pluginPoint: 'itemTemplate.view.footer',
  priority: 10,
  render: ({node, context}) => {
    node.innerHTML = `Hi ${context.item.displayName} from plugin!`
  }
}
