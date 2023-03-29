import {Dash} from '../index'
import RadarDash from './RadarDash'
import {xyDashOptions} from '../util'

const DASH_ID = 'radar'

export const radar: Dash = {
    id: DASH_ID,
    options: [...xyDashOptions],
    labelFieldName: 'xField',
    icon: 'RadarChartOutlined',
    render: ({context}) => <RadarDash {...context}/>
}
