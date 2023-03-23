import {Pie, PieConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashRenderer, DoughnutDashOpts, doughnutDashOpts, InnerDashRenderProps} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, parseDashColor} from '../../util/dashboard'

const {locale, dash: dashConfig} = appConfig.dashboard
const legendConfig = dashConfig?.all?.legend

export default class DoughnutDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.doughnut

    listOpts = (): DashOpt[] => [...doughnutDashOpts]

    getLabelField = () => ({
        name: 'colorField'
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <DoughnutDash {...props}/>
    }
}

function DoughnutDash({dataset, dash, data}: InnerDashRenderProps) {
    const {angleField, colorField, radius, innerRadius, hideLegend, legendPosition} = dash.optValues as DoughnutDashOpts
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
            content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
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
        color: parseDashColor(),
        locale
    }

    return <Pie {...config} />
}
