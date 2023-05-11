import {Dash} from '../index'
import ScatterDash from './ScatterDash'
import ScatterDashOptionsForm from './ScatterDashOptionsForm'

const DASH_ID = 'scatter'

export const scatter: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <ScatterDashOptionsForm {...props}/>,
    icon: 'DotChartOutlined',
    render: ({context}) => <ScatterDash {...context}/>
}
