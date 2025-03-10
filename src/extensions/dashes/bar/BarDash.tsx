import _ from 'lodash'
import {useMemo} from 'react'
import {Alert} from 'antd'
import {Bar, BarConfig} from '@ant-design/charts'
import {v4 as uuidv4} from 'uuid'

import {defaultDashColor, defaultDashColors, columnType, formatValue, isTemporal} from 'src/bi/util'
import {DashEventHandler, DashRenderContext} from '../index'
import {LegendPosition} from '../util'
import * as RulesService from 'src/services/rules'
import {useBIData, useBiProperties} from '../../../bi/util/hooks'
import {handleDashClick} from '../util/antdPlot'

interface BarDashOpts {
  xField?: string
  yField?: string
  seriesField?: string
  legendPosition?: LegendPosition
  hideLegend?: boolean
  xAxisLabelAutoRotate?: boolean
  isStack?: boolean
  isGroup?: boolean
  rules?: string
}

export default function BarDash({dataset, dash, data, onDashClick}: DashRenderContext) {
  const {openDashboard} = useBIData()
  const optValues = dash.optValues as BarDashOpts
  const {relatedDashboardId} = dash
  const {hideLegend, legendPosition, xAxisLabelAutoRotate, isStack, isGroup, rules} = optValues
  const xField = Array.isArray(optValues.xField) ? optValues.xField[0] : optValues.xField
  const yField = Array.isArray(optValues.yField) ? optValues.yField[0] : optValues.yField
  const seriesField = Array.isArray(optValues.seriesField) ? optValues.seriesField[0] : optValues.seriesField
  const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
  const seriesData = seriesField ? _.uniqBy(data, seriesField) : []
  const biProps = useBiProperties()
  const {colors10, colors20} = biProps.dash.all
  const {dateFormatString, timeFormatString, dateTimeFormatString} = biProps.dateTime
  const {dash: dashProps, fractionDigits, locale} = biProps
  const axisLabelStyle = dashProps.all.axisLabelStyle
  const legendConfig = dashProps.all.legend
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
    handleDashClick(chart, event, yField, queryFilter => {
      if (relatedDashboardId) openDashboard(relatedDashboardId, queryFilter)
      else onDashClick(queryFilter.value)
    })

  const config: BarConfig = {
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
    isStack,
    isGroup,
    xAxis: {
      label: {
        autoRotate: xAxisLabelAutoRotate,
        style: axisLabelStyle
      },
      type: isTemporal(xColumn.type) ? 'time' : undefined
    },
    yAxis: {
      label: {
        style: axisLabelStyle
      },
      type: isTemporal(yColumn.type) ? 'time' : undefined
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

  return <Bar {...config} key={relatedDashboardId ?? uuidv4()} />
}
