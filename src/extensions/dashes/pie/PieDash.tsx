import _ from 'lodash'
import {useMemo} from 'react'
import {Alert} from 'antd'
import {Pie, PieConfig} from '@ant-design/charts'

import {DashEventHandler, DashRenderContext} from '..'
import {defaultDashColors, formatValue, handleDashClick} from 'src/bi/util'
import {LegendPosition} from '../util'
import biConfig from 'src/config/bi'
import * as RulesService from 'src/services/rules'
import {useBI} from 'src/bi/hooks'

interface PieDashOptions {
    angleField?: string
    colorField?: string
    radius?: number
    legendPosition?: LegendPosition
    hideLegend?: boolean
    rules?: string
}

const {locale, percentFractionDigits, dash: dashConfig} = biConfig
const legendConfig = dashConfig?.all?.legend

export default function PieDash({dataset, dash, data}: DashRenderContext) {
    const {openDashboard} = useBI()
    const {optValues, relatedDashboardId} = dash
    const {
        angleField,
        colorField,
        radius,
        hideLegend,
        legendPosition,
        rules
    } = optValues as PieDashOptions
    const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
    const seriesData = colorField ? _.uniqBy(data, colorField) : []
    const seriesColors = colorField ? RulesService.getSeriesColors(fieldRules, colorField, seriesData, defaultDashColors(seriesData.length)) : []

    if (!angleField)
        return <Alert message="angleField attribute not specified" type="error"/>

    if (!colorField)
        return <Alert message="colorField attribute not specified" type="error"/>

    const columns = dataset.spec.columns ?? {}
    const angleColumn = columns[angleField]
    const colorColumn = columns[colorField]
    if (angleColumn == null || colorColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

    const handleEvent: DashEventHandler | undefined =
        relatedDashboardId ?
            (chart, event) => handleDashClick(chart, event, colorField, queryFilter => openDashboard(relatedDashboardId, queryFilter)) :
            undefined

    const config: PieConfig = {
        appendPadding: 10,
        data,
        angleField,
        colorField,
        radius,
        legend: hideLegend ? false : {
            position: legendPosition ?? 'top-left',
            label: {
                style: legendConfig?.label?.style
            },
            itemName: {
                style: legendConfig?.itemName?.style
            }
        },
        label: {
            type: 'inner',
            offset: '-30%',
            content: ({ percent }) => `${(percent * 100).toFixed(percentFractionDigits)}%`,
            style: dashConfig?.pie?.labelStyle
        },
        interactions: [{
            type: 'element-selected',
        }, {
            type: 'element-active',
        }],
        autoFit: true,
        meta: {
            [angleField]: {
                alias: angleColumn.alias || angleField,
                formatter: (value: any) => formatValue(value, angleColumn.type)
            },
            [colorField]: {
                alias: colorColumn.alias || colorField,
                formatter: (value: any) => formatValue(value, colorColumn.type)
            }
        },
        color: seriesColors,
        locale,
        onEvent: handleEvent
    }

    return <Pie {...config} key={relatedDashboardId}/>
}
