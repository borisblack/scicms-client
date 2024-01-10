import {Dash} from '../index'
import ScatterDashSuspense from './ScatterDashSuspense'
import ScatterDashOptionsForm from './ScatterDashOptionsForm'

const DASH_ID = 'scatter'

export const scatter: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <ScatterDashOptionsForm {...props}/>,
    render: ({context}) => <ScatterDashSuspense {...context}/>
}
