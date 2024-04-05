import {CustomComponent} from '../../index'
import UserRoles from './UserRoles'

const COMPONENT_ID = 'userRoles'

export const userRoles: CustomComponent = {
  id: COMPONENT_ID,
  mountPoint: 'user.tabs.begin',
  priority: 10,
  title: 'Roles',
  icon: 'KeyOutlined',
  render: ({context}) => <UserRoles key={COMPONENT_ID} {...context}/>
}
