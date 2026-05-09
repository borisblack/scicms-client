import DashboardSpec from 'src/bi/DashboardSpec/DashboardSpec'
import {Dashboard} from 'src/types/bi'
import {Plugin} from '../Plugin'

const DASHBOARD_SPEC_COMPONENT_ID = 'dashboardSpec'

export class DashboardPlugin extends Plugin<Dashboard> {
  override onLoad() {
    this.addComponent({
      id: DASHBOARD_SPEC_COMPONENT_ID,
      mountPoint: 'dashboard.tabs.end',
      priority: 10,
      title: 'Spec',
      icon: 'BoxPlotOutlined',
      render: ({context}) => <DashboardSpec key={DASHBOARD_SPEC_COMPONENT_ID} {...context} />
    })
  }

  override onUnload() {
    throw new Error('Method not implemented.')
  }
}
