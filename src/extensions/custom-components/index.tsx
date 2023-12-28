import _ from 'lodash'
import {ReactElement, ReactNode} from 'react'
import {FormInstance} from 'antd'

import {IBuffer} from 'src/types'
import {ItemDataWrapper} from 'src/types/schema'
import customComponentConfig from 'src/config/custom-component'

/* Mount points:
default.header
default.footer
default.content
<itemName>.default.header
<itemName>.default.footer
<itemName>.default.content
view.header
view.footer
view.content
view.content.form.begin
view.content.form.end
<itemName>.view.header
<itemName>.view.footer
<itemName>.view.content
<itemName>.view.content.form.begin
<itemName>.view.content.form.end
tabs.content
tabs.begin
tabs.end
<itemName>.tabs.content
<itemName>.tabs.begin
<itemName>.tabs.end
 */

export interface CustomComponent {
    id: string
    mountPoint: string | 'default.header' | 'default.content' | 'default.footer' | 'view.header' | 'view.footer'
        | 'view.content' | 'view.content.form.begin' | 'view.content.form.end'
        | 'tabs.content' | 'tabs.begin' | 'tabs.end'
    priority: number
    title?: string // for tabs rendering
    icon?: string // for tabs rendering
    render: ({context}: CustomComponentRenderProps) => ReactNode
}

export interface CustomComponentRenderProps {
    context: CustomComponentRenderContext
}

export interface CustomComponentRenderContext {
    data: ItemDataWrapper,
    form?: FormInstance | null
    buffer: IBuffer
    onBufferChange: (buffer: IBuffer) => void
}

const customComponents: CustomComponent[] = customComponentConfig.components.sort((a, b) => a.priority - b.priority)

const componentsByMountPoint = _.groupBy(customComponents, component => component.mountPoint)

export function hasComponents(...mountPoints: string[]): boolean {
    for (const mountPoint of mountPoints) {
        if (mountPoint in componentsByMountPoint)
            return true
    }
    return false
}

export const getComponents = (mountPoint: string): CustomComponent[] => componentsByMountPoint[mountPoint] ?? []

export function renderComponents(mountPoint: string, context: CustomComponentRenderContext): ReactElement | null {
    const components = componentsByMountPoint[mountPoint]
    if (!components)
        return null

    return (
        <>
            {components.map(component => component.render({context}))}
        </>
    )
}