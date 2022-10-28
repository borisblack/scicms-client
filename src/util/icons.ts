import * as antdIcons from '@ant-design/icons'
import * as faIcons from 'react-icons/fa'
import {DashType} from '../types'

export const allIcons: {[name: string]: any} = {...antdIcons, ...faIcons}

export function getDashIcon(dashType: DashType) {
    switch (dashType) {
        case DashType.bar:
            return antdIcons.BarChartOutlined
        case DashType.bubble:
        case DashType.bubbleMap:
            return antdIcons.DotChartOutlined
        case DashType.doughnut:
            return faIcons.FaChartPie
        case DashType.line:
            return antdIcons.LineChartOutlined
        case DashType.pie:
            return antdIcons.PieChartOutlined
        case DashType.polarArea:
            return faIcons.FaChartPie
        case DashType.radar:
            return antdIcons.RadarChartOutlined
        case DashType.scatter:
            return antdIcons.DotChartOutlined
        default:
            return antdIcons.BarChartOutlined
    }
}