import * as antdIcons from '@ant-design/icons'
import * as faIcons from 'react-icons/fa'
import {DashType} from '../types'

export const allIcons: {[name: string]: any} = {...antdIcons, ...faIcons}

export function getDashIcon(dashType: DashType) {
    switch (dashType) {
        case DashType.bar:
            return antdIcons.BarChartOutlined
        default:
            return antdIcons.BarChartOutlined
    }
}