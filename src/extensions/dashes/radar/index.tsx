import {Dash} from '../index'
import RadarDash from './RadarDash'
import RadarDashOptionsForm from './RadarDashOptionsForm'

const DASH_ID = 'radar'

export const radar: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <RadarDashOptionsForm {...props}/>,
    render: ({context}) => <RadarDash {...context}/>
}
