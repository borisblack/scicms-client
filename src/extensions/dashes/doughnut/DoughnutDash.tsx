import _ from 'lodash'
import {useMemo} from 'react'
import {Alert} from 'antd'
import {Pie, PieConfig} from '@ant-design/charts'
import {v4 as uuidv4} from 'uuid'

import {DashEventHandler, DashRenderContext} from '..'
import {defaultDashColors, columnType, formatValue, toPercent} from 'src/bi/util/util'
import {LegendPosition} from '../util'
import * as RulesService from 'src/services/rules'
import {useBIData, useBiProperties} from 'src/bi/util/hooks'
import {handleDashClick} from '../util/antdPlot'

export interface DoughnutDashOptions {
  angleField?: string | string[]
  colorField?: string | string[]
  radius?: number
  innerRadius?: number
  legendPosition?: LegendPosition
  hideLegend?: boolean
  rules?: string
}

export default function DoughnutDash({dataset, dash, data, onDashClick}: DashRenderContext) {
  const {openDashboard} = useBIData()
  const optValues = dash.optValues as DoughnutDashOptions
  const {relatedDashboardId} = dash
  const {radius, innerRadius, hideLegend, legendPosition, rules} = optValues
  const angleField = Array.isArray(optValues.angleField) ? optValues.angleField[0] : optValues.angleField
  const colorField = Array.isArray(optValues.colorField) ? optValues.colorField[0] : optValues.colorField
  const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
  const seriesData = colorField ? _.uniqBy(data, colorField) : []
  const biProps = useBiProperties()
  const {colors10, colors20} = biProps.dash.all
  const {dateFormatString, timeFormatString, dateTimeFormatString} = biProps.dateTime
  const {fractionDigits, percentFractionDigits, locale} = biProps
  const legendConfig = biProps.dash.all.legend
  const statisticConfig = biProps.dash.doughnut?.statistic
  const seriesColors = colorField
    ? RulesService.getSeriesColors(
        fieldRules,
        colorField,
        seriesData,
        defaultDashColors(seriesData.length, colors10, colors20)
      )
    : []

  if (!angleField) return <Alert message="angleField attribute not specified" type="error" />

  if (!colorField) return <Alert message="colorField attribute not specified" type="error" />

  const columns = {...(dataset.spec.columns ?? {}), ...dash.fields}
  const angleColumn = columns[angleField]
  const colorColumn = columns[colorField]
  if (angleColumn == null || colorColumn == null) return <Alert message="Invalid columns specification" type="error" />

  const statistic = statisticConfig?.title == null ? {} : {title: statisticConfig.title}
  const handleEvent: DashEventHandler = (chart, event) =>
    handleDashClick(chart, event, colorField, queryFilter => {
      if (relatedDashboardId) openDashboard(relatedDashboardId, queryFilter)
      else onDashClick(queryFilter.value)
    })

  const config: PieConfig = {
    appendPadding: 10,
    data,
    angleField,
    colorField,
    radius,
    innerRadius,
    legend: hideLegend
      ? false
      : {
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
      content: ({percent}) => `${toPercent(percent, percentFractionDigits)}%`,
      style: biProps.dash.doughnut?.labelStyle
    },
    statistic,
    interactions: [
      {
        type: 'element-selected'
      },
      {
        type: 'element-active'
      }
    ],
    autoFit: true,
    meta: {
      [angleField]: {
        alias: angleColumn.alias || angleField,
        formatter: (value: any) =>
          formatValue({
            value,
            type: columnType(angleColumn),
            dateFormatString,
            timeFormatString,
            dateTimeFormatString,
            fractionDigits
          })
      },
      [colorField]: {
        alias: colorColumn.alias || colorField,
        formatter: (value: any) =>
          formatValue({
            value,
            type: columnType(colorColumn),
            dateFormatString,
            timeFormatString,
            dateTimeFormatString,
            fractionDigits
          })
      }
    },
    color: seriesColors,
    locale,
    onEvent: handleEvent
  }

  return <Pie {...config} key={relatedDashboardId ?? uuidv4()} />
}
