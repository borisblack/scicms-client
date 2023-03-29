import {Dash} from '../index'
import PieDash from './PieDash'
import {doughnutDashOptions} from '../util'

const DASH_ID = 'pie'

export const pie: Dash = {
    id: DASH_ID,
    options: doughnutDashOptions.filter(opt => opt.name !== 'innerRadius'),
    labelFieldName: 'colorField',
    icon: 'PieChartOutlined',
    render: ({context}) => <PieDash {...context}/>
}
