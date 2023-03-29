import {CustomComponent} from '../../index'
import DashboardSpec from './DashboardSpec'

const COMPONENT_ID = 'dashboardSpec'

export const dashboardSpec: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'dashboard.tabs.end',
    priority: 10,
    title: 'Spec',
    icon: 'BoxPlotOutlined',
    render: ({context}) => <DashboardSpec key={COMPONENT_ID} {...context}/>
}