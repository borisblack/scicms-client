import {ITEM_TEMPLATE_ITEM_NAME} from 'src/config/constants'
import {Plugin} from '../Plugin'
import {handleItemTemplateApiOperation} from './itemTemplateApiHandler'

export class ItemTemplatePlugin extends Plugin {
  override onLoad(): void {
    // this.addApiMiddleware({
    //   id: 'itemTemplateMiddleware',
    //   itemName: ITEM_TEMPLATE_ITEM_NAME,
    //   priority: 10,
    //   handle: handleItemTemplateApiOperation
    // })
  }

  override onUnload(): void {
    throw new Error('Method not implemented.')
  }
}