import {FC, useEffect, useMemo, useRef} from 'react'
import Chart from 'chart.js/auto'

import {DashType} from '../../types'
import {InnerDashProps} from '.'
import {mapLabels, mapMetrics} from '../../util/dashboard'

const RadarDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.radar)
        throw new Error('Illegal dash type')

    const labels = useMemo(() => mapLabels(dash, data), [dash, data])
    const preparedData = useMemo(() => mapMetrics(dash, data), [dash, data])
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

        const chart = new Chart(ctx, {
            type: DashType.radar,
            data: {
                labels,
                datasets: [{
                    label: dash.name,
                    data: preparedData,
                    fill: true,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    pointBackgroundColor: 'rgb(255, 99, 132)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 99, 132)'
                }]
            },
            options: {
                maintainAspectRatio: !fullScreen
            }
        })

        return () => { chart.destroy() }
    }, [dash.name, data, fullScreen, labels, preparedData])

    return (
        <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    )
}

export default RadarDash