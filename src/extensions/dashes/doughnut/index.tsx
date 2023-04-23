import {Dash} from '../index'
import DoughnutDash from './DoughnutDash'
import {doughnutDashOptions} from '../util'

const DASH_ID = 'doughnut'

export const doughnut: Dash = {
    id: DASH_ID,
    options: [...doughnutDashOptions],
    icon: 'FaChartPie',
    render: ({context}) => <DoughnutDash {...context}/>
}
