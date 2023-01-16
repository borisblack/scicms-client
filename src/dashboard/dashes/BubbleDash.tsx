// import _ from 'lodash'
import {FC, useEffect, useMemo, useRef} from 'react'
import Chart from 'chart.js/auto'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import {map3dMetrics, mapLabels, temporalTypeSet, timeScaleProps} from '../../util/dashboard'

const BubbleDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, dataset, data}) => {
    if (dash.type !== DashType.bubble)
        throw new Error('Illegal dash type')

    const labels = useMemo(() => mapLabels(dataset, data), [data, dataset])
    const preparedData = useMemo(() => map3dMetrics(dataset, data), [data, dataset])
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

        if (temporalTypeSet.has(dataset.metricType)) {
            scales.y = {
                ...timeScaleProps,
                // min: _.min(preparedData.map(it => it.y))?.toISOString()
            }
        }

        const chart = new Chart(ctx, {
            type: DashType.bubble,
            data: {
                labels,
                datasets: [{
                    label: dash.name,
                    data: preparedData,
                    backgroundColor: 'rgb(255, 99, 132)'
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
                },
                maintainAspectRatio: !fullScreen
            }
        })

        return () => { chart.destroy() }
    }, [dash.name, dataset.metricType, fullScreen, labels, preparedData])

    return (
        <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    )
}

export default BubbleDash