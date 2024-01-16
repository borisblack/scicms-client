import {Dash} from '../index'
import RadarDashSuspense from './RadarDashSuspense'
import RadarDashOptionsForm from './RadarDashOptionsForm'

const DASH_ID = 'radar'

export const radar: Dash = {
    id: DASH_ID,
    icon: 'RadarChartOutlined',
    axes: [],
    renderOptionsForm: (props) => <RadarDashOptionsForm {...props}/>,
    render: ({context}) => <RadarDashSuspense {...context}/>
}
