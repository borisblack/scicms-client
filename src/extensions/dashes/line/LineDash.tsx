import _ from 'lodash'
import {useMemo} from 'react'
import {Alert} from 'antd'
import {Line, LineConfig} from '@ant-design/charts'
import {v4 as uuidv4} from 'uuid'

import {DashEventHandler, DashRenderContext} from '..'
import {defaultDashColor, defaultDashColors, columnType, formatValue, isTemporal} from 'src/bi/util'
import {LegendPosition} from '../util'
import * as RulesService from 'src/services/rules'
import {useBIData, useBiProperties} from 'src/bi/util/hooks'
import {handleDashClick} from '../util/antdPlot'

interface LineDashOptions {
  xField?: string
  yField?: string
  seriesField?: string
  legendPosition?: LegendPosition
  hideLegend?: boolean
  xAxisLabelAutoRotate?: boolean
  rules?: string
}

export default function LineDash({dataset, dash, data, onDashClick}: DashRenderContext) {
  const {openDashboard} = useBIData()
  const optValues = dash.optValues as LineDashOptions
  const {relatedDashboardId} = dash
  const {hideLegend, legendPosition, xAxisLabelAutoRotate, rules} = optValues
  const xField = Array.isArray(optValues.xField) ? optValues.xField[0] : optValues.xField
  const yField = Array.isArray(optValues.yField) ? optValues.yField[0] : optValues.yField
  const seriesField = Array.isArray(optValues.seriesField) ? optValues.seriesField[0] : optValues.seriesField
  const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
  const seriesData = seriesField ? _.uniqBy(data, seriesField) : []
  const biProps = useBiProperties()
  const {colors10, colors20} = biProps.dash.all
  const {dateFormatString, timeFormatString, dateTimeFormatString} = biProps.dateTime
  const {dash: dashConfig, locale, fractionDigits} = biProps
  const axisLabelStyle = dashConfig?.all?.axisLabelStyle
  const legendConfig = dashConfig?.all?.legend
  const seriesColors = seriesField
    ? RulesService.getSeriesColors(
        fieldRules,
        seriesField,
        seriesData,
        defaultDashColors(seriesData.length, colors10, colors20)
      )
    : []
  const defaultColor = defaultDashColor(colors10, colors20)

  if (!xField) return <Alert message="xField attribute not specified" type="error" />

  if (!yField) return <Alert message="yField attribute not specified" type="error" />

  const columns = {...(dataset.spec.columns ?? {}), ...dash.fields}
  const xColumn = columns[xField]
  const yColumn = columns[yField]
  if (xColumn == null || yColumn == null) return <Alert message="Invalid columns specification" type="error" />

  const handleEvent: DashEventHandler = (chart, event) =>
    handleDashClick(chart, event, seriesField ?? xField, queryFilter => {
      if (relatedDashboardId) openDashboard(relatedDashboardId, queryFilter)
      else onDashClick(queryFilter.value)
    })

  const config: LineConfig = {
    data,
    xField,
    yField,
    seriesField,
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
    autoFit: true,
    xAxis: {
      label: {
        autoRotate: xAxisLabelAutoRotate,
        style: axisLabelStyle
      },
      type: isTemporal(xColumn.type) ? 'time' : undefined
    },
    yAxis: {
      type: isTemporal(yColumn.type) ? 'time' : undefined,
      label: {
        style: axisLabelStyle
      }
    },
    meta: {
      [xField]: {
        alias: xColumn.alias || xField,
        formatter: (value: any) =>
          formatValue({
            value,
            type: columnType(xColumn),
            dateFormatString,
            timeFormatString,
            dateTimeFormatString,
            fractionDigits
          })
      },
      [yField]: {
        alias: yColumn.alias || yField,
        formatter: (value: any) =>
          formatValue({
            value,
            type: columnType(yColumn),
            dateFormatString,
            timeFormatString,
            dateTimeFormatString,
            fractionDigits
          })
      }
    },
    color: seriesField
      ? seriesColors
      : record => RulesService.getFieldColor(fieldRules, record) ?? (defaultColor as string),
    locale,
    onEvent: handleEvent
  }

  return <Line {...config} key={relatedDashboardId ?? uuidv4()} />
}
