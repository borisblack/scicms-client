import {CustomComponent} from '../../.'
import AccessMask from './AccessMask'

const COMPONENT_ID = 'accessMask'

export const accessMask: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'access.view.content.form.end',
    priority: 10,
    render: ({context}) => <AccessMask key={COMPONENT_ID} {...context}/>
}
