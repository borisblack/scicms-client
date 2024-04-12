import {Plugin} from '../Plugin'
import {UserGroups, UserRoles} from './components'

const USER_ROLES_COMPONENT_ID = 'userRoles'
const USER_GROUPS_COMPONENT_ID = 'userGroups'

export class UserPlugin extends Plugin {
  override onLoad() {
    this.addComponent({
      id: USER_ROLES_COMPONENT_ID,
      mountPoint: 'user.tabs.begin',
      priority: 10,
      title: 'Roles',
      icon: 'KeyOutlined',
      render: ({context}) => <UserRoles key={USER_ROLES_COMPONENT_ID} {...context}/>
    })

    this.addComponent({
      id: USER_GROUPS_COMPONENT_ID,
      mountPoint: 'user.tabs.begin',
      priority: 20,
      title: 'Groups',
      icon: 'TeamOutlined',
      render: ({context}) => <UserGroups key={USER_GROUPS_COMPONENT_ID} {...context}/>
    })
  }

  override onUnload() {
    throw new Error('Method not implemented.')
  }
}