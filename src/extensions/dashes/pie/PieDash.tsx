import {DashRenderContext} from '../index'
import {Alert} from 'antd'
import {Pie, PieConfig} from '@ant-design/charts'
import {defaultDashColor, defaultDashColors, formatValue} from '../../../util/bi'
import {LegendPosition} from '../util'
import biConfig from '../../../config/bi'
import RulesService from '../../../services/rules'
import {useMemo} from 'react'
import _ from 'lodash'

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
const rulesService = RulesService.getInstance()

export default function PieDash({dataset, dash, data}: DashRenderContext) {
    const {
        angleField,
        colorField,
        radius,
        hideLegend,
        legendPosition,
        rules
    } = dash.optValues as PieDashOptions
    const fieldRules = useMemo(() => rulesService.parseRules(rules), [rules])
    const seriesData = colorField ? _.uniqBy(data, colorField).map(r => r[colorField]) : []
    const seriesColors = colorField ? rulesService.getSeriesColors(fieldRules, colorField, seriesData, defaultDashColors(seriesData.length)) : []

    if (!angleField)
        return <Alert message="angleField attribute not specified" type="error"/>

    if (!colorField)
        return <Alert message="colorField attribute not specified" type="error"/>

    const columns = dataset.spec.columns ?? {}
    const angleColumn = columns[angleField]
    const colorColumn = columns[colorField]
    if (angleColumn == null || colorColumn == null)
        return <Alert message="Invalid columns specification" type="error"/>

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
        locale
    }

    return <Pie {...config} />
}