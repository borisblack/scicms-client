import {DashOptionType} from '../../bi'
import {Dash} from '..'
import BarDash from './BarDash'
import {xyDashOptions} from '../util'

const DASH_ID = 'bar'

export const bar: Dash = {
    id: DASH_ID,
    priority: 10,
    options: [
        ...xyDashOptions,
        {name: 'xAxisLabelAutoRotate', type: DashOptionType.boolean, label: 'Auto rotate x-axis label'}
    ],
    labelFieldName: 'yField',
    icon: 'BarChartOutlined',
    render: ({context}) => <BarDash {...context}/>
}
