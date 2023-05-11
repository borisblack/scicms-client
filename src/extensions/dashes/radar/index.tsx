import {Dash} from '../index'
import RadarDash from './RadarDash'
import RadarDashOptionsForm from './RadarDashOptionsForm'

const DASH_ID = 'radar'

export const radar: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <RadarDashOptionsForm {...props}/>,
    icon: 'RadarChartOutlined',
    render: ({context}) => <RadarDash {...context}/>
}
