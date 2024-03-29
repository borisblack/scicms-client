import _ from 'lodash'

import {IBuffer} from 'src/types'
import {Item, ItemData} from 'src/types/schema'
import pluginConfig from 'src/config/plugin'

/* Plugin points:
default.header
default.content
default.footer
<itemName>.default.header
<itemName>.default.content
<itemName>.default.footer
view.header
view.content
view.footer
<itemName>.view.header
<itemName>.view.content
<itemName>.view.footer
tabs.content
<itemName>.tabs.content
 */

export interface CustomPlugin {
    id: string
    pluginPoint: string | 'default.header' | 'default.content' | 'default.footer' | 'view.header' | 'view.footer' | 'view.content' | 'tabs.content'
    priority: number
    render: ({node, context}: CustomPluginRenderProps) => void
}

export interface CustomPluginRenderProps {
    node: HTMLElement,
    context: CustomPluginRenderContext
}

export interface CustomPluginRenderContext {
    item: Item
    buffer: IBuffer
    data?: ItemData | null
    onBufferChange: (buffer: IBuffer) => void
}

const plugins: CustomPlugin[] = pluginConfig.plugins.sort((a, b) => a.priority - b.priority)

const pluginsByPluginPoint: {[pluginPoint: string]: CustomPlugin[]} = _.groupBy(plugins, plugin => plugin.pluginPoint)

export function hasPlugins(...pluginPoints: string[]): boolean {
    for (const pluginPoint of pluginPoints) {
        if (pluginPoint in pluginsByPluginPoint)
            return true
    }
    return false
}

export function renderPlugins(pluginPoint: string, node: HTMLElement, context: CustomPluginRenderContext) {
    const plugins = pluginsByPluginPoint[pluginPoint]
    plugins?.forEach(plugin => {
        console.debug(`Rendering plugin [${plugin.id}] with pluginPoint = ${pluginPoint} and item = ${context.item.name}`)
        plugin.render({node, context})
    })
}
