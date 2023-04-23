import {Dash} from '../index'
import ColumnDash from './ColumnDash'
import ColumnDashOptionsForm from './ColumnDashOptionsForm'

const DASH_ID = 'column'

export const column: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <ColumnDashOptionsForm {...props}/>,
    icon: 'BarChartOutlined',
    render: ({context}) => <ColumnDash {...context}/>
}
