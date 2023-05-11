import {Dash} from '../index'
import DoughnutDash from './DoughnutDash'
import DoughnutDashOptionsForm from './DoughnutDashOptionsForm'

const DASH_ID = 'doughnut'

export const doughnut: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <DoughnutDashOptionsForm {...props}/>,
    icon: 'FaChartPie',
    render: ({context}) => <DoughnutDash {...context}/>
}
