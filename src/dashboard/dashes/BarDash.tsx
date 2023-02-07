import {FC} from 'react'
import {Bar, BarConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import appConfig from '../../config'

const BarDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data, }) => {
    if (dash.type !== DashType.bar)
        throw new Error('Illegal dash type')

    const {metricField, labelField} = dash
    if (metricField == null || labelField == null)
        throw new Error('Illegal argument')

    const config: BarConfig = {
        data: data.map(it => ({...it, [labelField]: it[labelField]?.toString()?.trim()})),
        xField: metricField,
        yField: labelField,
        seriesField: labelField,
        // legend: {
        //     position: 'top-left',
        // },
        // xAxis: {
        //     label: {
        //         autoRotate: false,
        //     }
        // },
        locale: appConfig.dashboard.locale
    }

    return <Bar {...config} />
}

export default BarDash