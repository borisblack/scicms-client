import {Dash} from '../index'
import BarDashSuspense from './BarDashSuspense'
import BarDashOptionsForm from './BarDashOptionsForm'

const DASH_ID = 'bar'

export const bar: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <BarDashOptionsForm {...props}/>,
    render: ({context}) => <BarDashSuspense {...context}/>
}
