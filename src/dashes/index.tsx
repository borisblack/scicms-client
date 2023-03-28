import _ from 'lodash'
import {ReactElement, ReactNode} from 'react'
import {DashOption, DashProps} from '../bi'
import dashConfig from '../config/dash'

export interface Dash {
    id: string
    priority: number
    options: DashOption[]
    labelFieldName: string
    icon: string
    render: ({context}: DashRenderProps) => ReactNode
}

export interface DashRenderProps {
    context: DashRenderContext
}

export interface DashRenderContext extends DashProps {
    fullScreen: boolean
    data: any[]
}

const allDashes: Dash[] = dashConfig.dashes.sort((a, b) => {
    let res: number
    if (a.id < b.id)
        res = -1
    else if (a.id > b.id)
        res = 1
    else
        res = 0

    if (res === 0)
        res = a.priority - b.priority

    return res
})

const dashesById = _.groupBy(allDashes, d => d.id)

export const getDashIds = (): string[] => Object.keys(dashesById)

export const hasDash = (id: string): boolean => id in dashesById

export const getDash = (id: string): Dash | undefined => hasDash(id) ? dashesById[id][0] : undefined

export function renderDash(id: string, context: DashRenderContext): ReactElement | null {
    const dashes = dashesById[id]
    if (!dashes)
        return null

    return <>{dashes[0].render({context})}</>
}
