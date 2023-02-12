import {Column, ColumnConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashProp, DashPropType, DashRenderer, InnerDashRenderProps, LegendPosition, legendPositions} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'

interface ColumnDashProps {
    xField?: string
    yField?: string
    seriesField?: string
    legendPosition?: LegendPosition
}

export class ColumnDashRenderer implements DashRenderer {
    private props: ColumnDashProps = {}

    supports = (dashType: DashType) => dashType === DashType.column

    listProps(): DashProp[] {
        return [
            {name: 'xField', type: DashPropType.string, label: 'x-axis field', required: true, fromDataset: true},
            {name: 'yField', type: DashPropType.string, label: 'y-axis field', required: true, fromDataset: true},
            {name: 'seriesField', type: DashPropType.string, label: 'Series field', fromDataset: true},
            {name: 'legendPosition', type: DashPropType.string, label: 'Legend position', opts: [...legendPositions]}
        ]
    }

    setProps(props: ColumnDashProps): void {
        this.props = props
    }

    render({dash, data}: InnerDashRenderProps) {
        if (!this.supports(dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        const {xField, yField, seriesField, legendPosition} = this.props
        if (!xField)
            return <Alert message="xField attribute not specified" type="error"/>

        if (!yField)
            return <Alert message="yField attribute not specified" type="error"/>

        const config: ColumnConfig = {
            data,
            xField,
            yField,
            seriesField,
            legend: {
                position: legendPosition,
            },
            autoFit: true,
            xAxis: {
                label: {
                    autoRotate: false,
                }
            },
            locale: appConfig.dashboard.locale
        }

        return <Column {...config} />
    }
}
