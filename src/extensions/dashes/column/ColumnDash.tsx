import _ from 'lodash'
import {useMemo} from 'react'
import {Alert} from 'antd'
import {Column, ColumnConfig} from '@ant-design/charts'
import {v4 as uuidv4} from 'uuid'

import {DashEventHandler, DashRenderContext} from 'src/extensions/dashes'
import {defaultDashColor, defaultDashColors, columnType, formatValue} from 'src/bi/util'
import {LegendPosition} from '../util'
import biConfig from 'src/config/bi'
import * as RulesService from 'src/services/rules'
import {useBI} from 'src/bi/util/hooks'
import {handleDashClick} from '../util/antdPlot'

interface ColumnDashOptions {
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

const {dash: dashConfig, locale} = biConfig
const axisLabelStyle = dashConfig?.all?.axisLabelStyle
const legendConfig = dashConfig?.all?.legend

export default function ColumnDash({dataset, dash, data, onDashClick}: DashRenderContext) {
  const {openDashboard} = useBI()
  const optValues = dash.optValues as ColumnDashOptions
  const {relatedDashboardId} = dash
  const {
    hideLegend,
    legendPosition,
    xAxisLabelAutoRotate,
    isStack,
    isGroup,
    rules
  } = optValues as ColumnDashOptions
  const xField = Array.isArray(optValues.xField) ? optValues.xField[0] : optValues.xField
  const yField = Array.isArray(optValues.yField) ? optValues.yField[0] : optValues.yField
  const seriesField = Array.isArray(optValues.seriesField) ? optValues.seriesField[0] : optValues.seriesField
  const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
  const seriesData = seriesField ? _.uniqBy(data, seriesField) : []
  const seriesColors = seriesField ? RulesService.getSeriesColors(fieldRules, seriesField, seriesData, defaultDashColors(seriesData.length)) : []
  const defaultColor = defaultDashColor()

  if (!xField)
    return <Alert message="xField attribute not specified" type="error"/>

  if (!yField)
    return <Alert message="yField attribute not specified" type="error"/>

  const columns = {...(dataset.spec.columns ?? {}), ...dash.fields}
  const xColumn = columns[xField]
  const yColumn = columns[yField]
  if (xColumn == null || yColumn == null)
    return <Alert message="Invalid columns specification" type="error"/>
    
  const handleEvent: DashEventHandler =
        (chart, event) => handleDashClick(chart, event, xField, queryFilter => {
          if (relatedDashboardId)
            openDashboard(relatedDashboardId, queryFilter)
          else
            onDashClick(queryFilter.value)
        })

  const config: ColumnConfig = {
    data,
    xField,
    yField,
    seriesField,
    legend: hideLegend ? false : {
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
      }
      // type: isTemporal(xColumn.type) ? 'time' : undefined
    },
    yAxis: {
      label: {
        style: axisLabelStyle
      }
      // type: isTemporal(yColumn.type) ? 'time' : undefined
    },
    meta: {
      [xField]: {
        alias: xColumn.alias,
        formatter: (value: any) => formatValue(value, columnType(xColumn))
      },
      [yField]: {
        alias: yColumn.alias,
        formatter: (value: any) => formatValue(value, columnType(yColumn))
      }
    },
    color: seriesField ? seriesColors : (record => (RulesService.getFieldColor(fieldRules, record) ?? (defaultColor as string))),
    locale,
    onEvent: handleEvent
  }

  return <Column {...config} key={relatedDashboardId ?? uuidv4()}/>
}
