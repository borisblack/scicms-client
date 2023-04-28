import {Dash} from '../index'
import ReportDashOptionsForm from './ReportDashOptionsForm'
import ReportDash from './ReportDash'

const DASH_ID = 'report'

export const report: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <ReportDashOptionsForm {...props}/>,
    icon: 'TableOutlined',
    height: 500,
    render: ({context}) => <ReportDash {...context}/>
}