import {DashRenderContext} from '../index'
import {Alert} from 'antd'
import {Pie, PieConfig} from '@ant-design/charts'
import {defaultDashColor, formatValue} from '../../../util/bi'
import {LegendPosition} from '../util'
import biConfig from '../../../config/bi'
import RulesService from '../../../services/rules'
import {useMemo} from 'react'

export interface DoughnutDashOptions {
    angleField?: string
    colorField?: string
    radius?: number
    innerRadius?: number
    legendPosition?: LegendPosition
    hideLegend?: boolean
    rules?: string
}

const {locale, percentFractionDigits, dash: dashConfig} = biConfig
const legendConfig = dashConfig?.all?.legend
const rulesService = RulesService.getInstance()

export default function DoughnutDash({dataset, dash, data}: DashRenderContext) {
    const {
        angleField,
        colorField,
        radius,
        innerRadius,
        hideLegend,
        legendPosition,
        rules
    } = dash.optValues as DoughnutDashOptions
    const fieldRules = useMemo(() => rulesService.parseRules(rules), [rules])
    const defaultColor = defaultDashColor()

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
        innerRadius,
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
            offset: '-50%',
            content: ({ percent }) => `${(percent * 100).toFixed(percentFractionDigits)}%`,
            style: dashConfig?.doughnut?.labelStyle
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
        color: record => (rulesService.getFieldColor(fieldRules, colorField, record) ?? (defaultColor as string)),
        locale
    }

    return <Pie {...config} />
}