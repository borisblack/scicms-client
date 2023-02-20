import {DashRenderer} from './dashes'
import {DashType} from '../types'
import ColumnDashRenderer from './dashes/ColumnDashRenderer'
import BarDashRenderer from './dashes/BarDashRenderer'
import AreaDashRenderer from './dashes/AreaDashRenderer'
import LineDashRenderer from './dashes/LineDashRenderer'
import StatisticDashRenderer from './dashes/StatisticDashRenderer'
import PieDashRenderer from './dashes/PieDashRenderer'
import DoughnutDashRenderer from './dashes/DoughnutDashRenderer'
import BubbleDashRenderer from './dashes/BubbleDashRenderer'
import ScatterDashRenderer from './dashes/ScatterDashRenderer'
import PolarAreaDashRenderer from './dashes/PolarAreaDashRenderer'
import RadarDashRenderer from './dashes/RadarDashRenderer'

const rendererCache: {[dashType: string]: DashRenderer} = {}

const renderers: DashRenderer[] = []

export const addRenderer = (renderer: DashRenderer) => renderers.push(renderer)

export function getRenderer(dashType: DashType): DashRenderer | null {
    let renderer: DashRenderer | undefined = rendererCache[dashType]
    if (renderer == null) {
        renderer = renderers.find(r => r.supports(dashType))
        if (renderer == null)
            return null

        rendererCache[dashType] = renderer
    }

    return renderer
}

addRenderer(new AreaDashRenderer())
addRenderer(new BarDashRenderer())
addRenderer(new BubbleDashRenderer())
addRenderer(new ColumnDashRenderer())
addRenderer(new DoughnutDashRenderer())
addRenderer(new LineDashRenderer())
addRenderer(new PieDashRenderer())
addRenderer(new PolarAreaDashRenderer())
addRenderer(new RadarDashRenderer())
addRenderer(new ScatterDashRenderer())
addRenderer(new StatisticDashRenderer())
