import _ from 'lodash'
import {lazy, memo, Suspense, useMemo} from 'react'
import {Alert} from 'antd'
import {PieConfig} from '@ant-design/charts'
import {DashEventHandler, DashRenderContext} from '../index'
import {defaultDashColors, formatValue, handleDashClick} from 'src/util/bi'
import {LegendPosition} from '../util'
import biConfig from 'src/config/bi'
import * as RulesService from 'src/services/rules'
import {FieldType} from 'src/types'

const Pie = lazy(() => import('./Pie'))

export interface DoughnutDashOptions {
    angleField?: string
    colorField?: string
    radius?: number
    innerRadius?: number
    legendPosition?: LegendPosition
    hideLegend?: boolean
    rules?: string
}

const {locale, fractionDigits, percentFractionDigits, dash: dashConfig} = biConfig
const legendConfig = dashConfig?.all?.legend
const statisticConfig = dashConfig?.doughnut?.statistic

function DoughnutDash({dataset, dash, data, onRelatedDashboardOpen}: DashRenderContext) {
    const {optValues, relatedDashboardId} = dash
    const {
        angleField,
        colorField,
        radius,
        innerRadius,
        hideLegend,
        legendPosition,
        rules
    } = optValues as DoughnutDashOptions
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

    const statistic = statisticConfig?.title == null ? {} : {title: statisticConfig.title}
    const handleEvent: DashEventHandler | undefined =
        relatedDashboardId ?
            (chart, event) => handleDashClick(chart, event, colorField, queryFilter => onRelatedDashboardOpen(relatedDashboardId, queryFilter)) :
            undefined

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
        statistic,
        interactions: [{
            type: 'element-selected',
        }, {
            type: 'element-active',
        }],
        autoFit: true,
        meta: {
            [angleField]: {
                alias: angleColumn.alias || angleField,
                formatter: (value: any) => formatValue(value?.toFixed(angleColumn.format === FieldType.int ? 0 : fractionDigits), angleColumn.type)
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

    return (
        <Suspense fallback={null}>
            <Pie {...config} key={relatedDashboardId}/>
        </Suspense>
    )
}

export default memo(DoughnutDash)