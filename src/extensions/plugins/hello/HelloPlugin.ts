import {Plugin} from "../Plugin"
import type {ItemData} from "src/types/schema"

export class HelloPlugin extends Plugin<ItemData> {
  override onLoad() {
    this.addRenderer({
      mountPoint: "itemTemplate.view.header",
      render: ({node, context}) => {
        node.innerHTML = `Hello ${context.item.displayName} from plugin!`
      }
    })
  }

  override onUnload() {
    throw new Error("Method not implemented.")
  }
}
