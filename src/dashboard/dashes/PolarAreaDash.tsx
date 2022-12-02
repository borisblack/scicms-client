import {FC, useEffect, useMemo, useRef} from 'react'
import Chart from 'chart.js/auto'

import {DashType} from '../../types'
import {InnerDashProps} from '.'
import {mapLabels, mapMetrics} from '../../util/dashboard'

const PolarAreaDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, data}) => {
    if (dash.type !== DashType.polarArea)
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
            type: DashType.polarArea,
            data: {
                labels,
                datasets: [{
                    label: dash.name,
                    data: preparedData,
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(75, 192, 192)',
                        'rgb(255, 205, 86)',
                        'rgb(201, 203, 207)',
                        'rgb(54, 162, 235)'
                    ]
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

export default PolarAreaDash