import {Dash} from '..'
import DoughnutDash from './DoughnutDash'
import {doughnutDashOptions} from '../util'

const DASH_ID = 'doughnut'

export const doughnut: Dash = {
    id: DASH_ID,
    priority: 10,
    options: [...doughnutDashOptions],
    labelFieldName: 'colorField',
    icon: 'FaChartPie',
    render: ({context}) => <DoughnutDash {...context}/>
}
