import {FC} from 'react'
import {Rose, RoseConfig} from '@ant-design/charts'

import {DashType} from '../../types'
import {InnerDashProps} from '.'

const PolarAreaDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.polarArea)
        throw new Error('Illegal dash type')

    const {metricField, labelField} = dash
    if (metricField == null || labelField == null)
        throw new Error('Illegal argument')

    const config: RoseConfig = {
        data,
        xField: labelField,
        yField: metricField,
        seriesField: labelField,
        radius: 0.9,
        // legend: {
        //     position: 'bottom',
        // },
    };
    return <Rose {...config} />;
}

export default PolarAreaDash