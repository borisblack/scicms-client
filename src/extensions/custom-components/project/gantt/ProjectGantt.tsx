import {Gantt, Task as GanttTask, ViewMode} from 'gantt-task-react'
import {CustomComponentRenderContext} from '../../.'
import {useEffect, useState} from 'react'
import {useAcl} from '../../../../util/hooks'
import {getStartEndDateForProject, singletonTasks} from './helper'
import ViewSwitcher from './ViewSwitcher'
import appConfig from '../../../../config'
import {TaskListHeader} from './TaskListHeader'
import {fetchAllProjectTasks} from './taskService'
import {Project} from './types'
import {mapToGanttTask, mapToProjectTask} from './taskMapper'
import 'gantt-task-react/dist/index.css'
import styles from './ProjectGantt.module.css'

export default function ProjectGantt({me, uniqueKey, items: itemMap, permissions: permissionMap, item, data, onBufferChange}: CustomComponentRenderContext) {
    const [view, setView] = useState<ViewMode>(ViewMode.Day)
    const [isChecked, setIsChecked] = useState(true)
    const [ganttTasks, setGanttTasks] = useState<GanttTask[]>(data?.id ? singletonTasks(data as Project) : [])
    const acl = useAcl(me, permissionMap, item, data)
    let columnWidth = 65;
    if (view === ViewMode.Year) {
        columnWidth = 350;
    } else if (view === ViewMode.Month) {
        columnWidth = 300;
    } else if (view === ViewMode.Week) {
        columnWidth = 250;
    }

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
    }, [data?.id])

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

    if (!data)
        return null

    return (
        <div className={styles.wrapper}>
            <ViewSwitcher
                onViewModeChange={viewMode => setView(viewMode)}
                onViewListChange={setIsChecked}
                isChecked={isChecked}
            />
            <h3>{data.name}</h3>
            <Gantt
                tasks={ganttTasks}
                viewMode={view}
                listCellWidth={isChecked ? '155px' : ''}
                columnWidth={columnWidth}
                locale={appConfig.i18nLng}
                TaskListHeader={TaskListHeader}
                onDateChange={handleTaskChange}
                onDelete={handleTaskDelete}
                onProgressChange={handleProgressChange}
                onDoubleClick={handleDblClick}
                onClick={handleClick}
                onSelect={handleSelect}
                onExpanderClick={handleExpanderClick}
            />
        </div>
    )
}