import {CustomComponent} from '../../index'
import ProjectGantt from './ProjectGantt'

const COMPONENT_ID = 'projectGantt'

export const projectGantt: CustomComponent = {
    id: COMPONENT_ID,
    mountPoint: 'project.tabs.end',
    priority: 10,
    title: 'Gantt Chart',
    icon: 'FaChartGantt',
    render: ({context}) => <ProjectGantt key={COMPONENT_ID} {...context}/>
}