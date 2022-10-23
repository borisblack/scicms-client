import {CustomComponent} from '../../index'
import DashboardPreview from './DashboardPreview'

const COMPONENT_ID = 'dashboardPreview'

export const dashboardPreview: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'dashboard.tabs.end',
    priority: 10,
    title: 'Preview',
    icon: 'CaretRightOutlined',
    render: ({context}) => <DashboardPreview key={COMPONENT_ID} {...context}/>
}