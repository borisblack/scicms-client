import {Dash} from '..'
import LineDash from './LineDash'
import {DashOptionType} from '../../bi'
import {xyDashOptions} from '../util'

const DASH_ID = 'line'

export const line: Dash = {
    id: DASH_ID,
    priority: 10,
    options: [
        ...xyDashOptions,
        {name: 'xAxisLabelAutoRotate', type: DashOptionType.boolean, label: 'Auto rotate x-axis label'}
    ],
    labelFieldName: 'xField',
    icon: 'LineChartOutlined',
    render: ({context}) => <LineDash {...context}/>
}
