import {Pie, PieConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {DashOpt, DashRenderer, doughnutDashOpts, DoughnutDashOpts, InnerDashRenderProps} from '.'
import appConfig from '../../config'
import {Alert} from 'antd'

type PieDashOpts = Omit<DoughnutDashOpts, 'innerRadius'>

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

function PieDash({dash, data}: InnerDashRenderProps) {
    const {angleField, colorField, angleFieldAlias, colorFieldAlias, radius, hideLegend, legendPosition} = dash.optValues as PieDashOpts
    if (!angleField)
        return <Alert message="angleField attribute not specified" type="error"/>

    if (!colorField)
        return <Alert message="colorField attribute not specified" type="error"/>

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
            style: {
                textAlign: 'center',
                fontSize: 14
            },
        },
        interactions: [{
            type: 'element-selected',
        }, {
            type: 'element-active',
        }],
        autoFit: true,
        meta: {
            [angleField]: {
                alias: angleFieldAlias
            },
            [colorField]: {
                alias: colorFieldAlias
            }
        },
        locale: appConfig.dashboard.locale
    }

    return <Pie {...config} />
}
