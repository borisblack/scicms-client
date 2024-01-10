import {Dash} from '../index'
import BubbleDashSuspense from './BubbleDashSuspense'
import BubbleDashOptionsForm from './BubbleDashOptionsForm'

const DASH_ID = 'bubble'

export const bubble: Dash = {
    id: DASH_ID,
    renderOptionsForm: (props) => <BubbleDashOptionsForm {...props}/>,
    render: ({context}) => <BubbleDashSuspense {...context}/>
}
