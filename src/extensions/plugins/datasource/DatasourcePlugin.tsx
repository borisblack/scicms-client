import {DATASOURCE_ITEM_NAME} from 'src/config/constants'
import {Plugin} from '../Plugin'
import {
  ConnectionStringAttributeField,
  MaxPoolSizeAttributeField,
  DatasourceMediaAttributeField,
  MinIdleAttributeField,
  DatasourcePasswordAttributeField,
  UsernameAttributeField
} from './attributeFields'

const CONNECTION_STRING_ATTRIBUTE_FIELD_ID = 'connectionString'
const USERNAME_ATTRIBUTE_FIELD_ID = 'username'
const PASSWORD_ATTRIBUTE_FIELD_ID = 'password'
const MAX_POOL_SIZE_ATTRIBUTE_FIELD_ID = 'maxPoolSize'
const MIN_IDLE_ATTRIBUTE_FIELD_ID = 'minIdle'
const MEDIA_ATTRIBUTE_FIELD_ID = 'media'

export class DatasourcePlugin extends Plugin {
  override onLoad() {
    // Attribute fields
    this.addAttributeField({
      id: CONNECTION_STRING_ATTRIBUTE_FIELD_ID,
      mountPoint: `${DATASOURCE_ITEM_NAME}.${CONNECTION_STRING_ATTRIBUTE_FIELD_ID}`,
      render: ({context}) => <ConnectionStringAttributeField {...context}/>
    })

    this.addAttributeField({
      id: USERNAME_ATTRIBUTE_FIELD_ID,
      mountPoint: `${DATASOURCE_ITEM_NAME}.${USERNAME_ATTRIBUTE_FIELD_ID}`,
      render: ({context}) => <UsernameAttributeField {...context}/>
    })

    this.addAttributeField({
      id: PASSWORD_ATTRIBUTE_FIELD_ID,
      mountPoint: `${DATASOURCE_ITEM_NAME}.${PASSWORD_ATTRIBUTE_FIELD_ID}`,
      render: ({context}) => <DatasourcePasswordAttributeField {...context}/>
    })

    this.addAttributeField({
      id: MAX_POOL_SIZE_ATTRIBUTE_FIELD_ID,
      mountPoint: `${DATASOURCE_ITEM_NAME}.${MAX_POOL_SIZE_ATTRIBUTE_FIELD_ID}`,
      render: ({context}) => <MaxPoolSizeAttributeField {...context}/>
    })

    this.addAttributeField({
      id: MIN_IDLE_ATTRIBUTE_FIELD_ID,
      mountPoint: `${DATASOURCE_ITEM_NAME}.${MIN_IDLE_ATTRIBUTE_FIELD_ID}`,
      render: ({context}) => <MinIdleAttributeField {...context}/>
    })

    this.addAttributeField({
      id: MEDIA_ATTRIBUTE_FIELD_ID,
      mountPoint: `${DATASOURCE_ITEM_NAME}.${MEDIA_ATTRIBUTE_FIELD_ID}`,
      render: ({context}) => <DatasourceMediaAttributeField {...context}/>
    })
  }

  override onUnload() {
    throw new Error('Method not implemented.')
  }
}