import {FC} from 'react'
import {Radar, RadarConfig} from '@ant-design/charts'

import {DashType} from '../../types'
import {InnerDashProps} from '.'
import appConfig from '../../config'

const RadarDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.radar)
        throw new Error('Illegal dash type')

    const {metricField, labelField} = dash
    if (metricField == null || labelField == null)
        throw new Error('Illegal argument')

    // const labels = useMemo(() => mapLabels(data, labelField), [data, labelField])
    // const preparedData = useMemo(() => mapMetrics(dash, data), [dash, data])
    // const canvasRef = useRef<HTMLCanvasElement>(null)
    //
    // useEffect(() => {
    //     const canvas = canvasRef.current
    //     if (!canvas)
    //         return
    //
    //     const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    //
    //     const chart = new Chart(ctx, {
    //         type: DashType.radar,
    //         data: {
    //             labels,
    //             datasets: [{
    //                 label: dash.name,
    //                 data: preparedData,
    //                 fill: true,
    //                 backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //                 borderColor: 'rgb(255, 99, 132)',
    //                 pointBackgroundColor: 'rgb(255, 99, 132)',
    //                 pointBorderColor: '#fff',
    //                 pointHoverBackgroundColor: '#fff',
    //                 pointHoverBorderColor: 'rgb(255, 99, 132)'
    //             }]
    //         },
    //         options: {
    //             maintainAspectRatio: !fullScreen
    //         }
    //     })
    //
    //     return () => { chart.destroy() }
    // }, [dash.name, data, fullScreen, labels, preparedData])
    //
    // return (
    //     <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    // )

    const config: RadarConfig = {
        data: data.map(it => ({...it, [labelField]: it[labelField]?.toString()?.trim()})),
        xField: labelField,
        yField: metricField,
        appendPadding: [0, 10, 0, 10],
        xAxis: {
            tickLine: null,
        },
        yAxis: {
            label: false,
            grid: {
                alternateColor: 'rgba(0, 0, 0, 0.04)',
            },
        },
        point: {
            size: 2,
        },
        area: {},
        locale: appConfig.dashboard.locale
    }

    return <Radar {...config} />
}

export default RadarDash