import {Pie, PieConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashRenderer, doughnutDashOpts, DoughnutDashOpts, InnerDashRenderProps} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'
import {formatValue, parseDashColor} from '../../util/dashboard'

type PieDashOpts = Omit<DoughnutDashOpts, 'innerRadius'>

const {locale, dash: dashConfig} = appConfig.dashboard

export default class PieDashRenderer implements DashRenderer {
    supports = (dashType: DashType) => dashType === DashType.pie

    listOpts = (): DashOpt[] => [...doughnutDashOpts.filter(o => o.name !== 'innerRadius')]

    getLabelField = () => ({
        name: 'colorField',
        alias: 'colorFieldAlias',
    })

    render(props: InnerDashRenderProps) {
        if (!this.supports(props.dash.type))
            return <Alert message="Unsupported dash type" type="error"/>

        return <PieDash {...props}/>
    }
}

function PieDash({dataset, dash, data}: InnerDashRenderProps) {
    const {angleField, colorField, angleFieldAlias, colorFieldAlias, radius, hideLegend, legendPosition} = dash.optValues as PieDashOpts
    if (!angleField)
        return <Alert message="angleField attribute not specified" type="error"/>

    if (!colorField)
        return <Alert message="colorField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    if (!columns || !columns[angleField] || !columns[colorField])
        return <Alert message="Invalid columns specification" type="error"/>

    const angleFieldType = columns[angleField].type
    const colorFieldType = columns[colorField].type
    const config: PieConfig = {
        appendPadding: 10,
        data,
        angleField,
        colorField,
        radius,
        legend: hideLegend ? false : {
            position: legendPosition ?? 'top-left'
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
                alias: angleFieldAlias,
                formatter: (value: any) => formatValue(value, angleFieldType)
            },
            [colorField]: {
                alias: colorFieldAlias,
                formatter: (value: any) => formatValue(value, colorFieldType)
            }
        },
        color: parseDashColor(),
        locale
    }

    return <Pie {...config} />
}
