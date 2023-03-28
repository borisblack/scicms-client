import {Dash} from '..'
import RadarDash from './RadarDash'
import {xyDashOptions} from '../util'

const DASH_ID = 'radar'

export const radar: Dash = {
    id: DASH_ID,
    priority: 10,
    options: [...xyDashOptions],
    labelFieldName: 'xField',
    icon: 'RadarChartOutlined',
    render: ({context}) => <RadarDash {...context}/>
}
