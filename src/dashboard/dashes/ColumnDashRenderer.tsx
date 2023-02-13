import {Column, ColumnConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashProp, DashPropType, DashRenderer, InnerDashRenderProps, LegendPosition, legendPositions} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {isTemporal} from '../../util/dashboard'

interface ColumnDashProps {
    xField?: string
    yField?: string
    xFieldAlias?: string
    yFieldAlias?: string
    seriesField?: string
    hideLegend?: boolean
    legendPosition?: LegendPosition
}

export class ColumnDashRenderer implements DashRenderer {
    private props: ColumnDashProps = {}

    supports = (dashType: DashType) => dashType === DashType.column

    listProps(): DashProp[] {
        return [
            {name: 'xField', type: DashPropType.string, label: 'x-axis field', required: true, fromDataset: true},
            {name: 'yField', type: DashPropType.string, label: 'y-axis field', required: true, fromDataset: true},
            {name: 'xFieldAlias', type: DashPropType.string, label: 'x-axis field alias'},
            {name: 'yFieldAlias', type: DashPropType.string, label: 'y-axis field alias'},
            {name: 'seriesField', type: DashPropType.string, label: 'Series field', fromDataset: true},
            {name: 'hideLegend', type: DashPropType.boolean, label: 'Hide legend'},
            {name: 'legendPosition', type: DashPropType.string, label: 'Legend position', opts: [...legendPositions]}
        ]
    }

    setProps(props: ColumnDashProps): void {
        this.props = props
    }

    render({dataset, dash, data}: InnerDashRenderProps) {
        if (!this.supports(dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        const {xField, yField, xFieldAlias, yFieldAlias, seriesField, hideLegend, legendPosition} = this.props
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
                position: legendPosition
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
