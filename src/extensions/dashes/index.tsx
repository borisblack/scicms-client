import _ from 'lodash'
import {ReactElement, ReactNode} from 'react'
import {DashOptionsFormProps, DashProps} from '../../bi'
import dashConfig from '../../config/dash'
import {Plot} from '@antv/g2plot'
import {PlotEvent} from '@ant-design/plots'

export interface Dash {
    id: string
    renderOptionsForm: (props: DashOptionsFormProps) => ReactNode
    height?: number
    render: (props: DashRenderProps) => ReactNode
}

export interface DashRenderProps {
    context: DashRenderContext
}

export interface DashRenderContext extends DashProps {
    height: number
    fullScreen: boolean
    data: any[]
}

export type DashEventHandler = (chart: Plot<any>, event: PlotEvent) => void

const allDashes: Dash[] = dashConfig.dashes.sort((a, b) => {
    if (a.id < b.id)
        return -1
    else if (a.id > b.id)
        return 1
    else
        return 0
})

const dashesById = _.mapKeys(allDashes, d => d.id)

export const getDashIds = (): string[] => Object.keys(dashesById)

export const hasDash = (id: string): boolean => id in dashesById

export const getDash = (id: string): Dash | undefined => dashesById[id]

export function renderDash(id: string, context: DashRenderContext): ReactElement | null {
    const dash = dashesById[id]
    if (dash == null)
        return null

    return <>{dash.render({context})}</>
}
