import _ from 'lodash'
import {ReactElement, ReactNode} from 'react'
import {PlotEvent} from '@ant-design/plots'
import {Plot} from '@antv/g2plot'

import dashConfig from 'src/config/dash'
import {Dataset} from 'src/types/bi'
import {FormInstance} from 'antd'
import {DashWrapperProps} from '../../bi/DashWrapper'

export interface Dash {
    id: string
    axes: IDashAxis[]
    renderOptionsForm: (props: DashOptionsFormProps) => ReactNode
    icon?: string
    height?: number
    render: (props: DashRenderProps) => ReactNode
}

interface IDashAxis {
    name: string
    label: string
    cardinality: number
    required: boolean
}

export interface DashOptionsFormProps {
    dataset: Dataset
    availableColNames: string[]
    fieldName: string
    form: FormInstance
    values: {[key: string]: any}
}

interface DashProps extends DashWrapperProps {
    dataset: Dataset
}

interface DashRenderProps {
    context: DashRenderContext
}

export interface DashRenderContext extends DashProps {
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

export const getDash = (id: string): Dash | undefined => dashesById.hasOwnProperty(id) ? {...dashesById[id]} : undefined

export function renderDash(id: string, context: DashRenderContext): ReactElement | null {
  const dash = dashesById[id]
  if (dash == null)
    return null

  return <>{dash.render({context})}</>
}
