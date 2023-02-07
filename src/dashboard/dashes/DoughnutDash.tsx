import {FC} from 'react'
import {Pie, PieConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import appConfig from '../../config'

const DoughnutDash: FC<InnerDashProps> = ({pageKey, fullScreen, dash, data}) => {
    if (dash.type !== DashType.doughnut)
        throw new Error('Illegal dash type')

    const {metricField, labelField} = dash
    if (metricField == null || labelField == null)
        throw new Error('Illegal argument')

    const config: PieConfig = {
        appendPadding: 10,
        data: data.map(it => ({...it, [labelField]: it[labelField]?.toString()?.trim()})),
        angleField: metricField,
        colorField: labelField,
        radius: 1,
        innerRadius: 0.6,
        label: {
            type: 'inner',
            offset: '-50%',
            content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
            style: {
                textAlign: 'center',
                fontSize: 14,
            },
        },
        interactions: [{
            type: 'element-selected',
        }, {
            type: 'element-active',
        }],
        locale: appConfig.dashboard.locale
    }

    return <Pie {...config} />
}

export default DoughnutDash