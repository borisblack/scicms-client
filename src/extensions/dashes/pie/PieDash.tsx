import _ from 'lodash'
import {useMemo} from 'react'
import {Alert} from 'antd'
import {Pie, PieConfig} from '@ant-design/charts'
import {v4 as uuidv4} from 'uuid'

import {DashEventHandler, DashRenderContext} from '..'
import {defaultDashColors, columnType, formatValue} from 'src/bi/util'
import {LegendPosition} from '../util'
import biConfig from 'src/config/bi'
import * as RulesService from 'src/services/rules'
import {useBI} from 'src/bi/util/hooks'
import {handleDashClick} from '../util/antdPlot'

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

export default function PieDash({dataset, dash, data, onDashClick}: DashRenderContext) {
    const {openDashboard} = useBI()
    const optValues = dash.optValues as PieDashOptions
    const {relatedDashboardId} = dash
    const {
        radius,
        hideLegend,
        legendPosition,
        rules
    } = optValues
    const angleField = Array.isArray(optValues.angleField) ? optValues.angleField[0] : optValues.angleField
    const colorField = Array.isArray(optValues.colorField) ? optValues.colorField[0] : optValues.colorField
    const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
    const seriesData = colorField ? _.uniqBy(data, colorField) : []
    const seriesColors = colorField ? RulesService.getSeriesColors(fieldRules, colorField, seriesData, defaultDashColors(seriesData.length)) : []

    if (!angleField)
        return <Alert message="angleField attribute not specified" type="error"/>

    if (!colorField)
        return <Alert message="colorField attribute not specified" type="error"/>

    const columns = {...(dataset.spec.columns ?? {}), ...dash.fields}
    const angleColumn = columns[angleField]
    const colorColumn = columns[colorField]
    if (angleColumn == null || colorColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

    const handleEvent: DashEventHandler =
        (chart, event) => handleDashClick(chart, event, colorField, queryFilter => {
            if (relatedDashboardId)
                openDashboard(relatedDashboardId, queryFilter)
            else
                onDashClick(queryFilter.value)
        })

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
                formatter: (value: any) => formatValue(value, columnType(angleColumn))
            },
            [colorField]: {
                alias: colorColumn.alias || colorField,
                formatter: (value: any) => formatValue(value, columnType(colorColumn))
            }
        },
        color: seriesColors,
        locale,
        onEvent: handleEvent
    }

    return <Pie {...config} key={relatedDashboardId ?? uuidv4()}/>
}
