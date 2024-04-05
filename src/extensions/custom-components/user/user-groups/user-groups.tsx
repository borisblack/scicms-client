import {CustomComponent} from '../../index'
import UserGroups from './UserGroups'

const COMPONENT_ID = 'userGroups'

export const userGroups: CustomComponent = {
  id: COMPONENT_ID,
  mountPoint: 'user.tabs.begin',
  priority: 20,
  title: 'Groups',
  icon: 'TeamOutlined',
  render: ({context}) => <UserGroups key={COMPONENT_ID} {...context}/>
}
