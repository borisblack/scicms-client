import {Dash} from '../index'
import ReportDashOptionsForm from './ReportDashOptionsForm'
import ReportDash from './ReportDash'

const DASH_ID = 'report'

export const report: Dash = {
  id: DASH_ID,
  icon: 'TableOutlined',
  axes: [
    {name: 'displayedColNames', label: 'Displayed columns', cardinality: -1, required: true},
    {name: 'keyColName', label: 'Key column', cardinality: 1, required: false}
  ],
  renderOptionsForm: props => <ReportDashOptionsForm {...props} />,
  render: ({context}) => <ReportDash {...context} />
}
