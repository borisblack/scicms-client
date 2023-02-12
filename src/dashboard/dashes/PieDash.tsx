import {FC} from 'react'
import {Pie, PieConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {InnerDashRenderProps} from '.'
import appConfig from '../../config'

const PieDash: FC<InnerDashRenderProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.pie)
        throw new Error('Illegal dash type')

    const {metricField, labelField} = dash
    if (metricField == null || labelField == null)
        throw new Error('Illegal argument')

    const config: PieConfig = {
        appendPadding: 10,
        data: data.map(it => ({...it, [labelField]: it[labelField]?.toString()?.trim()})),
        angleField: metricField,
        colorField: labelField,
        radius: 0.9,
        // legend: {
        //     position: 'top-left',
        // },
        label: {
            type: 'inner',
            offset: '-30%',
            content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
            style: {
                fontSize: 14,
                textAlign: 'center',
            },
        },
        interactions: [{
            type: 'element-active',
        }],
        locale: appConfig.dashboard.locale
    }

    return <Pie {...config} />
}

export default PieDash