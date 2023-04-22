import {Dash} from '../index'
import BarDash from './BarDash'
import BarDashOptionsForm from './BarDashOptionsForm'

const DASH_ID = 'bar'

export const bar: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <BarDashOptionsForm {...props}/>,
    labelFieldName: 'yField',
    icon: 'BarChartOutlined',
    render: ({context}) => <BarDash {...context}/>
}
