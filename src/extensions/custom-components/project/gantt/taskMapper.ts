import {Task as GanttTask} from 'gantt-task-react'
import {Project, Task} from './types'

export function mapToProjectTask(project: Project): GanttTask {
    return {
        id: project.id,
        name: project.name,
        start: new Date(project.start),
        end: new Date(project.end),
        progress: project.progress,
        type: 'project',
        displayOrder: 0
    }
}

export function mapToGanttTask(task: Task): GanttTask {
    return {
        id: task.id,
        name: task.name,
        project: task.project.data.id,
        start: new Date(task.start),
        end: new Date(task.end),
        progress: task.progress,
        type: task.isMilestone ? 'milestone' : 'task',
        displayOrder: task.sortOrder ?? undefined,
        dependencies: task.dependencies.data.map(dependency => dependency.target.data.id)
    }
}