import {lazy, Suspense, useEffect, useState} from 'react'
import {Task as GanttTask, ViewMode} from 'gantt-task-react'
import {CustomComponentRenderContext} from '../../.'
import {useAcl} from '../../../../util/hooks'
import {getStartEndDateForProject, singletonTasks} from './helper'
import ViewSwitcher from './components/ViewSwitcher'
import appConfig from '../../../../config'
import TaskListHeader from './components/TaskListHeader'
import TooltipContent from './components/TooltipContent'
import {fetchAllProjectTasks} from './taskService'
import {Project} from './types'
import {mapToGanttTask, mapToProjectTask} from './taskMapper'
import 'gantt-task-react/dist/index.css'
import styles from './ProjectGantt.module.css'

const DEFAULT_COLUMN_WIDTH = 65
const YEAR_COLUMN_WIDTH = 350
const MONTH_COLUMN_WIDTH = 300
const WEEK_COLUMN_WIDTH = 250

const Gantt = lazy(() => import('./components/Gantt'))

function calculateColumnWidth(viewMode: ViewMode) {
    if (viewMode === ViewMode.Year)
        return YEAR_COLUMN_WIDTH

    if (viewMode === ViewMode.Month)
        return MONTH_COLUMN_WIDTH

    if (viewMode === ViewMode.Week)
        return WEEK_COLUMN_WIDTH

    return DEFAULT_COLUMN_WIDTH
}

export default function ProjectGantt({me, uniqueKey, items: itemMap, permissions: permissionMap, item, data, onBufferChange}: CustomComponentRenderContext) {
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
    const columnWidth = calculateColumnWidth(viewMode)
    const [isChecked, setIsChecked] = useState(true)
    const [ganttTasks, setGanttTasks] = useState<GanttTask[]>(data?.id ? singletonTasks(data as Project) : [])
    const [version, setVersion] = useState<number>(0)
    const acl = useAcl(me, permissionMap, item, data)

    useEffect(() => {
        if (!data?.id)
            return

        fetchAllProjectTasks(data.id)
            .then(tasks => {
                const newTasks = [
                    mapToProjectTask(data as Project),
                    ...tasks.map(task => mapToGanttTask(task))
                ]
                setGanttTasks(newTasks)
            })
    }, [data, version])

    const handleTaskChange = (task: GanttTask) => {
        console.log('On date change Id:' + task.id)
        let newTasks = ganttTasks.map(t => (t.id === task.id ? task : t))
        if (task.project) {
            const [start, end] = getStartEndDateForProject(newTasks, task.project)
            const project = newTasks[newTasks.findIndex(t => t.id === task.project)]
            if (
                project.start.getTime() !== start.getTime() ||
                project.end.getTime() !== end.getTime()
            ) {
                const changedProject = { ...project, start, end }
                newTasks = newTasks.map(t =>
                    t.id === task.project ? changedProject : t
                )
            }
        }
        setGanttTasks(newTasks)
    }

    const handleTaskDelete = (task: GanttTask) => {
        const conf = window.confirm('Are you sure about ' + task.name + ' ?')
        if (conf) {
            setGanttTasks(ganttTasks.filter(t => t.id !== task.id))
        }
        return conf
    }

    const handleProgressChange = async (task: GanttTask) => {
        setGanttTasks(ganttTasks.map(t => (t.id === task.id ? task : t)))
        console.log('On progress change Id:' + task.id)
    }

    const handleDblClick = (task: GanttTask) => {
        alert('On Double Click event Id:' + task.id)
    }

    const handleClick = (task: GanttTask) => {
        console.log('On Click event Id:' + task.id)
    }

    const handleSelect = (task: GanttTask, isSelected: boolean) => {
        console.log(task.name + ' has ' + (isSelected ? 'selected' : 'unselected'))
    }

    const handleExpanderClick = (task: GanttTask) => {
        setGanttTasks(ganttTasks.map(t => (t.id === task.id ? task : t)));
        console.log('On expander click Id:' + task.id);
    }

    const handleRefresh = () => setVersion(prevVersion => prevVersion + 1)

    if (!data)
        return null

    return (
        <div className={styles.wrapper}>
            <ViewSwitcher
                isChecked={isChecked}
                onViewModeChange={viewMode => setViewMode(viewMode)}
                onViewListChange={setIsChecked}
                onRefresh={handleRefresh}
            />
            <h3>{data.name}</h3>
            <Suspense fallback={null}>
                <Gantt
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    listCellWidth={isChecked ? '155px' : ''}
                    columnWidth={columnWidth}
                    locale={appConfig.i18nLng}
                    TooltipContent={TooltipContent}
                    TaskListHeader={TaskListHeader}
                    onDateChange={handleTaskChange}
                    onDelete={handleTaskDelete}
                    onProgressChange={handleProgressChange}
                    onDoubleClick={handleDblClick}
                    onClick={handleClick}
                    onSelect={handleSelect}
                    onExpanderClick={handleExpanderClick}
                />
            </Suspense>
        </div>
    )
}