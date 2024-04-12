import {ITEM_ITEM_NAME} from 'src/config/constants'
import {Plugin} from '../Plugin'
import {Attributes, Indexes} from './components'
import {handleItemApiOperation} from './itemApiHandler'

const ITEM_ATTRIBUTES_COMPONENT_ID = 'itemAttributes'
const ITEM_TEMPLATE_ATTRIBUTES_COMPONENT_ID = 'itemTemplateAttributes'
const ITEM_INDEXES_COMPONENT_ID = 'itemIndexes'
const ITEM_TEMPLATE_INDEXES_COMPONENT_ID = 'itemTemplateIndexes'

export class ItemPlugin extends Plugin {
  override onLoad() {
    // Components
    this.addComponent({
      id: ITEM_ATTRIBUTES_COMPONENT_ID,
      priority: 10,
      mountPoint: 'item.tabs.begin',
      title: 'Attributes',
      icon: 'BarsOutlined',
      render: ({context}) => <Attributes key={ITEM_ATTRIBUTES_COMPONENT_ID} {...context}/>
    })

    this.addComponent({
      id: ITEM_TEMPLATE_ATTRIBUTES_COMPONENT_ID,
      priority: 10,
      mountPoint: 'itemTemplate.tabs.begin',
      title: 'Attributes',
      icon: 'BarsOutlined',
      render: ({context}) => <Attributes key={ITEM_TEMPLATE_ATTRIBUTES_COMPONENT_ID} {...context}/>
    })

    this.addComponent({
      id: ITEM_INDEXES_COMPONENT_ID,
      mountPoint: 'item.tabs.begin',
      priority: 20,
      title: 'Indexes',
      icon: 'HolderOutlined',
      render: ({context}) => <Indexes key={ITEM_INDEXES_COMPONENT_ID} {...context}/>
    })

    this.addComponent({
      id: ITEM_TEMPLATE_INDEXES_COMPONENT_ID,
      mountPoint: 'itemTemplate.tabs.begin',
      priority: 20,
      title: 'Indexes',
      icon: 'HolderOutlined',
      render: ({context}) => <Indexes key={ITEM_TEMPLATE_INDEXES_COMPONENT_ID} {...context}/>
    })

    // API middleware
    this.addApiMiddleware({
      id: 'itemMiddleware',
      itemName: ITEM_ITEM_NAME,
      priority: 10,
      handle: handleItemApiOperation
    })
  }

  override onUnload() {
    throw new Error('Method not implemented.')
  }
}