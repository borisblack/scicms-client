import {FC, useEffect, useMemo, useRef} from 'react'
import {DateTime} from 'luxon'
import Chart from 'chart.js/auto'

import {AttrType, DashType, MetricType} from '../types'
import {DashProps} from '.'

const temporalTypes = [AttrType.date, AttrType.time, AttrType.datetime, AttrType.timestamp]
const temporalTypeSet = new Set(temporalTypes)
function parseMetrics(metrics: any[], metricType: MetricType): any[] {
    if (temporalTypeSet.has(metricType))
        return metrics.map(m => DateTime.fromISO(m).toJSDate())

    return metrics
}

const BarDash: FC<DashProps> = ({pageKey, dash, results}) => {
    const labels = useMemo(
        () => results.map((result, i) => result.map(d => d[dash.datasets[i].label as string])).flatMap(label => label),
        [dash.datasets, results]
    )

    const data = useMemo(
        () => results.map((result, i) => result.map(d => d[dash.datasets[i].metric as string])).flatMap(metrics => parseMetrics(metrics, dash.metricType)),
        [dash, results]
    )

    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        const barChart = new Chart(ctx, {
            type: DashType.bar,
            data: {
                labels,
                datasets: [{
                    label: dash.name,
                    data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })

        return () => { barChart.destroy() }
    }, [dash.name, data, labels, results])

    if (dash.type !== DashType.bar)
        throw new Error('Illegal dash type')

    return (
        <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    )
}

export default BarDash