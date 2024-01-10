import {Dash} from '../index'
import DoughnutDashSuspense from './DoughnutDashSuspense'
import DoughnutDashOptionsForm from './DoughnutDashOptionsForm'

const DASH_ID = 'doughnut'

export const doughnut: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <DoughnutDashOptionsForm {...props}/>,
    render: ({context}) => <DoughnutDashSuspense {...context}/>
}
