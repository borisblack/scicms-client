import {CustomComponent} from '../../index'
import RoleUser from './RoleUser'

const COMPONENT_ID = 'roleUser'

export const roleUser: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'role.view.content.form.begin',
    priority: 10,
    render: ({context}) => <RoleUser key={COMPONENT_ID} {...context}/>
}
