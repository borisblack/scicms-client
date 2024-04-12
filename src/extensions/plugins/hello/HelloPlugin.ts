import {Plugin} from '../Plugin'

export class HelloPlugin extends Plugin {
  override onLoad() {
    this.addRenderer({
      mountPoint: 'itemTemplate.view.header',
      render: ({node, context}) => {
        node.innerHTML = `Hello ${context.item.displayName} from plugin!`
      }
    })
  }

  override onUnload() {
    throw new Error('Method not implemented.')
  }
}
