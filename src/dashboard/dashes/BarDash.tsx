// import _ from 'lodash'
import {FC, useEffect, useMemo, useRef} from 'react'
import Chart from 'chart.js/auto'

import {DashType} from '../../types'
import {DashProps} from '.'
import {mapLabels, mapMetrics, temporalTypeSet, timeScaleProps} from '../../util/dashboard'

const BarDash: FC<DashProps> = ({pageKey, dash, data}) => {
    if (dash.type !== DashType.bar)
        throw new Error('Illegal dash type')

    const labels = useMemo(() => mapLabels(dash, data), [dash, data])
    const preparedData = useMemo(() => mapMetrics(dash, data), [dash, data])
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        const scales: any = {}
        if (temporalTypeSet.has(dash.metricType)) {
            scales.y = {
                ...timeScaleProps,
                // min: _.min(preparedData)?.toISOString()
            }
        }

        const chart = new Chart(ctx, {
            type: DashType.bar,
            data: {
                labels,
                datasets: [{
                    label: dash.name,
                    data: preparedData,
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
                scales
            }
        })

        return () => { chart.destroy() }
    }, [dash.metricType, dash.name, data, labels, preparedData])

    return (
        <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    )
}

export default BarDash