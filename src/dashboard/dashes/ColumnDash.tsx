import {FC} from 'react'
import {Column} from '@ant-design/plots'

import {DashType} from '../../types'
import {InnerDashProps} from '.'
import {ColumnConfig} from '@ant-design/charts'

const ColumnDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data, }) => {
    if (dash.type !== DashType.column)
        throw new Error('Illegal dash type')

    const {metricField, labelField} = dash
    if (metricField == null || labelField == null)
        throw new Error('Illegal argument')

    const config: ColumnConfig = {
        data: data.map(it => ({...it, [labelField]: it[labelField]?.toString()?.trim()})),
        xField: labelField,
        yField: metricField,
        seriesField: labelField,
        // legend: {
        //     position: 'top-left',
        // },
        autoFit: true,
        // xAxis: {
        //     label: {
        //         autoRotate: false,
        //     }
        // },
    }

    return <Column {...config} />
}

export default ColumnDash