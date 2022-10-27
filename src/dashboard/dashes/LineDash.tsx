// import _ from 'lodash'
import {FC, useEffect, useMemo, useRef} from 'react'
import Chart from 'chart.js/auto'
import {DashType} from '../../types'
import {DashProps} from '.'
import {mapLabels, map2dMetrics, temporalTypeSet, timeScaleProps} from '../../util/dashboard'

const LineDash: FC<DashProps> = ({pageKey, dash, data}) => {
    if (dash.type !== DashType.line)
        throw new Error('Illegal dash type')

    const labels = useMemo(() => mapLabels(dash, data), [dash, data])
    const preparedData = useMemo(() => map2dMetrics(dash, data), [dash, data])
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        const scales: any = {
            x: {
                ...timeScaleProps,
                // min: _.min(preparedData.map(it => it.x.toJSDate()))?.toISOString()
            }
        }

        if (temporalTypeSet.has(dash.metricType)) {
            scales.y = {
                ...timeScaleProps,
                // min: _.min(preparedData.map(it => it.y))?.toISOString()
            }
        }

        const chart = new Chart(ctx, {
            type: DashType.line,
            data: {
                labels,
                datasets: [{
                    label: dash.name,
                    data: preparedData,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const {label, dataIndex} = context
                                return ` ${label}: ${labels[dataIndex]}`
                            }
                        }
                    }
                }
            }
        })

        return () => { chart.destroy() }
    }, [dash.metricType, dash.name, data, labels, preparedData])

    return (
        <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    )
}

export default LineDash