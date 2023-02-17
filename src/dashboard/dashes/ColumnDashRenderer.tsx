import {Column, ColumnConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashOptType, DashRenderer, InnerDashRenderProps, LegendPosition, legendPositions} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {isTemporal} from '../../util/dashboard'

interface ColumnDashOpts {
    xField?: string
    yField?: string
    xFieldAlias?: string
    yFieldAlias?: string
    seriesField?: string
    hideLegend?: boolean
    legendPosition?: LegendPosition
}

export class ColumnDashRenderer implements DashRenderer {
    private optValues: ColumnDashOpts = {}

    supports = (dashType: DashType) => dashType === DashType.column

    listOpts(): DashOpt[] {
        return [
            {name: 'xField', type: DashOptType.string, label: 'x-axis field', required: true, fromDataset: true},
            {name: 'yField', type: DashOptType.string, label: 'y-axis field', required: true, fromDataset: true},
            {name: 'xFieldAlias', type: DashOptType.string, label: 'x-axis field alias'},
            {name: 'yFieldAlias', type: DashOptType.string, label: 'y-axis field alias'},
            {name: 'seriesField', type: DashOptType.string, label: 'Series field', fromDataset: true},
            {name: 'legendPosition', type: DashOptType.string, label: 'Legend position', enumSet: [...legendPositions], defaultValue: 'top-left'},
            {name: 'hideLegend', type: DashOptType.boolean, label: 'Hide legend'}
        ]
    }

    render({dataset, dash, data}: InnerDashRenderProps) {
        if (!this.supports(dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        const {xField, yField, xFieldAlias, yFieldAlias, seriesField, hideLegend, legendPosition} = dash.optValues as ColumnDashOpts
        if (!xField)
            return <Alert message="xField attribute not specified" type="error"/>

        if (!yField)
            return <Alert message="yField attribute not specified" type="error"/>

        const {columns} = dataset.spec
        const xFieldType = columns[xField].type
        const yFieldType = columns[yField].type
        const config: ColumnConfig = {
            data,
            xField,
            yField,
            seriesField,
            legend: hideLegend ? false : {
                position: legendPosition ?? 'top-left'
            },
            autoFit: true,
            xAxis: {
                // label: {
                //     autoRotate: false,
                // },
                type: isTemporal(xFieldType) ? 'time' : undefined
            },
            yAxis: {
                type: isTemporal(yFieldType) ? 'time' : undefined
            },
            meta: {
                [xField]: {
                    alias: xFieldAlias
                },
                [yField]: {
                    alias: yFieldAlias
                }
            },
            locale: appConfig.dashboard.locale
        }

        return <Column {...config} />
    }
}
