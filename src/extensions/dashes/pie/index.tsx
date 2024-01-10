import {Dash} from '../index'
import PieDashSuspense from './PieDashSuspense'
import PieDashOptionsForm from './PieDashOptionsForm'

const DASH_ID = 'pie'

export const pie: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <PieDashOptionsForm {...props}/>,
    render: ({context}) => <PieDashSuspense {...context}/>
}
