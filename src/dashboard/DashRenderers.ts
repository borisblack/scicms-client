import {DashRenderer} from './dashes'
import {DashType} from '../types'
import {ColumnDashRenderer} from './dashes/ColumnDashRenderer'

const rendererCache: {[dashType: string]: DashRenderer} = {}

const renderers: DashRenderer[] = []

const addRenderer = (renderer: DashRenderer) => renderers.push(renderer)

export function getRenderer(dashType: DashType): DashRenderer {
    let renderer: DashRenderer | undefined = rendererCache[dashType]
    if (renderer == null) {
        renderer = renderers.find(r => r.supports(dashType))
        if (renderer == null)
            throw new Error(`No renderer for ${dashType} dash`)

        rendererCache[dashType] = renderer
    }

    return renderer
}

addRenderer(new ColumnDashRenderer())