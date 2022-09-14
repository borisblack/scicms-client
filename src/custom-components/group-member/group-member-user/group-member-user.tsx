import {CustomComponent} from '../../index'
import GroupMemberUser from './GroupMemberUser'

const COMPONENT_ID = 'groupMemberUser'

export const groupMemberUser: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'groupMember.view.content.form.end',
    priority: 10,
    render: ({context}) => <GroupMemberUser key={COMPONENT_ID} {...context}/>
}
