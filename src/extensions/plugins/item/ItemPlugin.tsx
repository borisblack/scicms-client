import {
  DEFAULT_SORT_ORDER_ATTR_NAME,
  INCLUDE_TEMPLATES_ATTR_NAME,
  ITEM_ITEM_NAME,
  NOT_LOCKABLE_ATTR_NAME
} from 'src/config/constants'
import {Plugin} from '../Plugin'
import {
  DefaultSortOrderAttributeField,
  IncludeTemplatesAttributeField,
  NotLockableAttributeField
} from './attributeFields'
import {Attributes, Indexes} from './components'

const ITEM_ATTRIBUTES_COMPONENT_ID = 'itemAttributes'
const ITEM_TEMPLATE_ATTRIBUTES_COMPONENT_ID = 'itemTemplateAttributes'
const ITEM_INDEXES_COMPONENT_ID = 'itemIndexes'
const ITEM_TEMPLATE_INDEXES_COMPONENT_ID = 'itemTemplateIndexes'
const DEFAULT_SORT_ORDER_ATTRIBUTE_FIELD_ID = 'defaultSortOrder'
const INCLUDE_TEMPLATES_ATTRIBUTE_FIELD_ID = 'includeTemplates'
const NOT_LOCKABLE_ATTRIBUTE_FIELD_ID = 'notLockable'

export class ItemPlugin extends Plugin {
  override onLoad() {
    // Components
    this.addComponent({
      id: ITEM_ATTRIBUTES_COMPONENT_ID,
      priority: 10,
      mountPoint: 'item.tabs.begin',
      title: 'Attributes',
      icon: 'BarsOutlined',
      render: ({context}) => <Attributes key={ITEM_ATTRIBUTES_COMPONENT_ID} {...context} />
    })

    this.addComponent({
      id: ITEM_TEMPLATE_ATTRIBUTES_COMPONENT_ID,
      priority: 10,
      mountPoint: 'itemTemplate.tabs.begin',
      title: 'Attributes',
      icon: 'BarsOutlined',
      render: ({context}) => <Attributes key={ITEM_TEMPLATE_ATTRIBUTES_COMPONENT_ID} {...context} />
    })

    this.addComponent({
      id: ITEM_INDEXES_COMPONENT_ID,
      mountPoint: 'item.tabs.begin',
      priority: 20,
      title: 'Indexes',
      icon: 'HolderOutlined',
      render: ({context}) => <Indexes key={ITEM_INDEXES_COMPONENT_ID} {...context} />
    })

    this.addComponent({
      id: ITEM_TEMPLATE_INDEXES_COMPONENT_ID,
      mountPoint: 'itemTemplate.tabs.begin',
      priority: 20,
      title: 'Indexes',
      icon: 'HolderOutlined',
      render: ({context}) => <Indexes key={ITEM_TEMPLATE_INDEXES_COMPONENT_ID} {...context} />
    })

    // Attribute fields
    this.addAttributeField({
      id: DEFAULT_SORT_ORDER_ATTRIBUTE_FIELD_ID,
      mountPoint: `${ITEM_ITEM_NAME}.${DEFAULT_SORT_ORDER_ATTR_NAME}`,
      render: ({context}) => <DefaultSortOrderAttributeField {...context} />
    })

    this.addAttributeField({
      id: INCLUDE_TEMPLATES_ATTRIBUTE_FIELD_ID,
      mountPoint: `${ITEM_ITEM_NAME}.${INCLUDE_TEMPLATES_ATTR_NAME}`,
      render: ({context}) => <IncludeTemplatesAttributeField {...context} />
    })

    // this.addAttributeField({
    //   id: NOT_LOCKABLE_ATTRIBUTE_FIELD_ID,
    //   mountPoint: `${ITEM_ITEM_NAME}.${NOT_LOCKABLE_ATTR_NAME}`,
    //   render: ({context}) => <NotLockableAttributeField {...context}/>
    // })

    // API middleware
    // this.addApiMiddleware({
    //   id: 'itemMiddleware',
    //   itemName: ITEM_ITEM_NAME,
    //   priority: 10,
    //   handle: handleItemApiOperation
    // })
  }

  override onUnload() {
    throw new Error('Method not implemented.')
  }
}
