import {Dash} from '../index'
import LineDash from './LineDash'
import LineDashOptionsForm from './LineDashOptionsForm'

const DASH_ID = 'line'

export const line: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <LineDashOptionsForm {...props}/>,
    render: ({context}) => <LineDash {...context}/>
}
