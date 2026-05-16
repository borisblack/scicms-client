import {ItemData} from "src/types/schema"
import {Plugin} from "../Plugin"

export class HiPlugin extends Plugin<ItemData> {
  override onLoad(): void {
    this.addRenderer({
      mountPoint: "itemTemplate.view.footer",
      render: ({node, context}) => {
        node.innerHTML = `Hi ${context.item.displayName} from plugin!`
      }
    })
  }

  override onUnload(): void {
    throw new Error("Method not implemented.")
  }
}
