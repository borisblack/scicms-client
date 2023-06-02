import {Dash} from '../index'
import BubbleDash from './BubbleDash'
import BubbleDashOptionsForm from './BubbleDashOptionsForm'

const DASH_ID = 'bubble'

export const bubble: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <BubbleDashOptionsForm {...props}/>,
    render: ({context}) => <BubbleDash {...context}/>
}
