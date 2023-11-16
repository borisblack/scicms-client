import {CustomComponentRenderContext} from '../../.'
import {DefaultItemTemplate} from '../../../../types'
import QueryManager from '../../../../services/query'
import {useEffect, useMemo, useState} from 'react'
import PermissionManager from '../../../../services/permission'
import {useAcl} from '../../../../util/hooks'

enum TaskStatus {
    STATUS_ACTIVE = 'STATUS_ACTIVE',
    STATUS_DONE = 'STATUS_DONE',
    STATUS_FAILED = 'STATUS_FAILED',
    STATUS_SUSPENDED = 'STATUS_SUSPENDED',
    STATUS_UNDEFINED = 'STATUS_UNDEFINED'
}

interface Project extends DefaultItemTemplate {
    name: string
    tasks?: {data: Task[]}
}

interface Task extends DefaultItemTemplate {
    sortOrder: number | null
    code: string
    name: string
    description: string | null
    level: number
    progress: number
    start: string
    end: string
    duration: number
    startIsMilestone: boolean | null
    endIsMilestone: boolean | null
    depends: string | null
    status: TaskStatus
    parent: {data: Task}
    assignments: {data: Assignment[]}
}

interface Resource extends DefaultItemTemplate {
    name: string
}

interface ProjectRole extends DefaultItemTemplate {
    name: string
}

interface Assignment extends DefaultItemTemplate {
    source: {data: Task}
    target: {data: Resource}
    role: {data: ProjectRole}
    effort: number
}

const PROJECT_ITEM_NAME = 'project'
const TASK_ITEM_NAME = 'task'

export default function ProjectGantt({me, items: itemMap, permissions: permissionMap, item, data, onBufferChange}: CustomComponentRenderContext) {
    const queryManager = useMemo(() => new QueryManager(itemMap), [itemMap])
    const acl = useAcl(me, permissionMap, item, data)
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        if (!data?.id)
            return

        queryManager.findAllRelated(
            PROJECT_ITEM_NAME, data.id,
            'tasks',
            itemMap[TASK_ITEM_NAME],
            {
                sorting: [{id: 'sortOrder', desc: false}],
                filters: [],
                pagination: {}
            }
        ).then(tasks => setTasks(tasks.data))
    }, [data?.id])

    return (
        <div>
            {tasks.map(task => <div key={task.name}>{task.name}</div>)}
        </div>
    )
}