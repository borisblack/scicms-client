import {Pie, PieConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashRenderer, doughnutDashOpts, DoughnutDashOpts, InnerDashRenderProps} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, parseDashColor} from '../../util/dashboard'

type PieDashOpts = Omit<DoughnutDashOpts, 'innerRadius'>

const {locale, dash: dashConfig} = appConfig.dashboard
const legendConfig = dashConfig?.all?.legend

export default class PieDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.pie

    listOpts = (): DashOpt[] => [...doughnutDashOpts.filter(o => o.name !== 'innerRadius')]

    getLabelField = () => ({
        name: 'colorField'
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <PieDash {...props}/>
    }
}

function PieDash({dataset, dash, data}: InnerDashRenderProps) {
    const {angleField, colorField, radius, hideLegend, legendPosition} = dash.optValues as PieDashOpts
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
            offset: '-30%',
            content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
            style: dashConfig?.pie?.labelStyle
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
