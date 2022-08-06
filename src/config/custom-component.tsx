import _ from 'lodash'
import {Item} from '../types'
import {helloComponent} from '../custom-components/hello'
import {hiComponent} from '../custom-components/hi'
import {ReactElement} from 'react'

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
<itemName>.view.header
<itemName>.view.footer
<itemName>.view.content
tabs.content
tabs.start
tabs.end
<itemName>.tabs.content
<itemName>.tabs.start
<itemName>.tabs.end
 */

export interface CustomComponent {
    id: string,
    mountPoint: string | 'default.header' | 'default.content' | 'default.footer' | 'view.header' | 'view.footer' | 'view.content' | 'tabs.content' | 'tabs.start' | 'tabs.end',
    priority: number,
    render: ({context}: CustomComponentRenderProps) => void
}

export interface CustomComponentRenderProps {
    context: CustomComponentRenderContext
}

interface CustomComponentRenderContext {
    item: Item
}

// Add custom components here
const customComponents = [
    helloComponent,
    hiComponent
].sort((a, b) => a.priority - b.priority)

const componentsByMountPoint = _.groupBy(customComponents, component => component.mountPoint)

export function hasComponents(...mountPoints: string[]): boolean {
    for (const mountPoint of mountPoints) {
        if (mountPoint in componentsByMountPoint)
            return true
    }
    return false
}

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