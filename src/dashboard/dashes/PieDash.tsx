import {FC, useEffect, useMemo, useRef} from 'react'
import Chart from 'chart.js/auto'

import {DashType} from '../../types'
import {InnerDashProps} from '.'
import {mapLabels, mapMetrics} from '../../util/dashboard'

const PieDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, dataset, data}) => {
    if (dash.type !== DashType.pie)
        throw new Error('Illegal dash type')

    const labels = useMemo(() => mapLabels(dataset, data), [data, dataset])
    const preparedData = useMemo(() => mapMetrics(dataset, data), [data, dataset])
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

        const chart = new Chart(ctx, {
            type: DashType.pie,
            data: {
                labels,
                datasets: [{
                    label: dash.name,
                    data: preparedData,
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)'
                    ],
                    hoverOffset: 4
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

export default PieDash