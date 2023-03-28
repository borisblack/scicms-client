import {Dash} from '..'
import ColumnDash from './ColumnDash'
import {DashOptionType} from '../../bi'
import {xyDashOptions} from '../util'

const DASH_ID = 'column'

export const column: Dash = {
    id: DASH_ID,
    priority: 10,
    options: [
        ...xyDashOptions,
        {name: 'xAxisLabelAutoRotate', type: DashOptionType.boolean, label: 'Auto rotate x-axis label'}
    ],
    labelFieldName: 'xField',
    icon: 'BarChartOutlined',
    render: ({context}) => <ColumnDash {...context}/>
}
