import {Dash} from '../index'
import PieDash from './PieDash'
import PieDashOptionsForm from './PieDashOptionsForm'

const DASH_ID = 'pie'

export const pie: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <PieDashOptionsForm {...props}/>,
    icon: 'PieChartOutlined',
    render: ({context}) => <PieDash {...context}/>
}
