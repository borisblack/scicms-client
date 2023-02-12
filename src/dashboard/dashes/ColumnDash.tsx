import {FC} from 'react'
import {Column, ColumnConfig} from '@ant-design/charts'
import {DashType} from '../../types'
import {InnerDashRenderProps} from '.'
import appConfig from '../../config'

const ColumnDash: FC<InnerDashRenderProps> = ({dash, data, }) => {
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
        xAxis: {
            label: {
                autoRotate: false,
            }
        },
        locale: appConfig.dashboard.locale
    }

    return <Column {...config} />
}

export default ColumnDash