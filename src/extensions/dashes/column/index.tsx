import {Dash} from '../index'
import ColumnDashSuspense from './ColumnDashSuspense'
import ColumnDashOptionsForm from './ColumnDashOptionsForm'

const DASH_ID = 'column'

export const column: Dash = {
    id: DASH_ID,
    icon: 'BarChartOutlined',
    axes: [],
    renderOptionsForm: (props) => <ColumnDashOptionsForm {...props}/>,
    render: ({context}) => <ColumnDashSuspense {...context}/>
}
