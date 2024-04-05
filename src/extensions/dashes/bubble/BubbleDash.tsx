import _ from 'lodash'
import {useMemo} from 'react'
import {Alert} from 'antd'
import {Scatter, ScatterConfig} from '@ant-design/charts'
import {v4 as uuidv4} from 'uuid'

import {defaultDashColor, defaultDashColors, columnType, formatValue, isTemporal} from 'src/bi/util'
import {DashEventHandler, DashRenderContext} from '..'
import biConfig from 'src/config/bi'
import {LegendPosition} from '../util'
import * as RulesService from 'src/services/rules'
import {useBI} from 'src/bi/util/hooks'
import {handleDashClick} from '../util/antdPlot'

interface BubbleDashOptions {
    xField?: string
    yField?: string
    sizeField?: string
    colorField?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
    xAxisLabelAutoRotate?: boolean
    rules?: string
}

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default function BubbleDash({dataset, dash, data, onDashClick}: DashRenderContext) {
  const {openDashboard} = useBI()
  const optValues = dash.optValues as BubbleDashOptions
  const {relatedDashboardId} = dash
  const {
    hideLegend,
    legendPosition,
    xAxisLabelAutoRotate,
    rules
  } = optValues
  const xField = Array.isArray(optValues.xField) ? optValues.xField[0] : optValues.xField
  const yField = Array.isArray(optValues.yField) ? optValues.yField[0] : optValues.yField
  const sizeField = Array.isArray(optValues.sizeField) ? optValues.sizeField[0] : optValues.sizeField
  const colorField = Array.isArray(optValues.colorField) ? optValues.colorField[0] : optValues.colorField
  const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
  const seriesData = colorField ? _.uniqBy(data, colorField) : []
  const seriesColors = colorField ? RulesService.getSeriesColors(fieldRules, colorField, seriesData, defaultDashColors(seriesData.length)) : []
  const defaultColor = defaultDashColor()

  if (!xField)
    return <Alert message="xField attribute not specified" type="error"/>

  if (!yField)
    return <Alert message="yField attribute not specified" type="error"/>

  if (!sizeField)
    return <Alert message="sizeField attribute not specified" type="error"/>

  const columns = {...(dataset.spec.columns ?? {}), ...dash.fields}
  const xColumn = columns[xField]
  const yColumn = columns[yField]
  const sizeColumn = columns[sizeField]
  if (xColumn == null || yColumn == null || sizeColumn == null)
    return <Alert message="Invalid columns specification" type="error"/>

  const handleEvent: DashEventHandler =
        (chart, event) => handleDashClick(chart, event, colorField ?? xField, queryFilter => {
          if (relatedDashboardId)
            openDashboard(relatedDashboardId, queryFilter)
          else
            onDashClick(queryFilter.value)
        })

  const config: ScatterConfig = {
    appendPadding: 10,
    data,
    xField,
    yField,
    sizeField,
    colorField,
    size: [4, 30], // min and max
    shape: 'circle',
    autoFit: true,
    pointStyle: {
      fillOpacity: 0.8,
      stroke: '#bbb'
    },
    legend: hideLegend ? false : {
      position: legendPosition ?? 'top-left',
      label: {
        style: legendConfig?.label?.style
      },
      itemName: {
        style: legendConfig?.itemName?.style
      }
    },
    xAxis: {
      label: {
        autoRotate: xAxisLabelAutoRotate,
        style: axisLabelStyle
      },
      type: isTemporal(xColumn.type) ? 'time' : undefined,
      grid: {
        line: {
          style: {stroke: '#eee'}
        }
      },
      line: {
        style: {stroke: '#aaa'}
      }
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
        formatter: (value: any) => formatValue(value, columnType(xColumn))
      },
      [yField]: {
        alias: yColumn.alias || yField,
        formatter: (value: any) => formatValue(value, columnType(yColumn))
      },
      [sizeField]: {
        alias: sizeColumn.alias || sizeField,
        formatter: (value: any) => formatValue(value, sizeColumn.type)
      }
    },
    color: colorField ? seriesColors : (record => (RulesService.getFieldColor(fieldRules, record) ?? (defaultColor as string))),
    locale,
    onEvent: handleEvent
  }

  return <Scatter {...config} key={relatedDashboardId ?? uuidv4()}/>
}
