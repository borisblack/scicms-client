import {DefaultItemTemplate} from 'src/types/schema'

export interface Project extends DefaultItemTemplate {
    name: string
    start: string
    end: string
    progress: number
    tasks?: {data: Task[]}
}

export interface Task extends DefaultItemTemplate {
    sortOrder: number | null
    name: string
    description: string | null
    project: {data: Project}
    parent: {data: Task | null}
    level: number | null
    start: string
    end: string
    progress: number
    isMilestone: boolean | null
    children: {data: Task[]}
    dependencies: {data: Dependency[]}
    assignments: {data: Assignment[]}
}

export interface Dependency extends DefaultItemTemplate {
    source: {data: Task}
    target: {data: Task}
}

export interface Resource extends DefaultItemTemplate {
    name: string
}

export interface ProjectRole extends DefaultItemTemplate {
    name: string
}

export interface Assignment extends DefaultItemTemplate {
    source: {data: Task}
    target: {data: Resource}
    role: {data: ProjectRole}
    effort: number
}