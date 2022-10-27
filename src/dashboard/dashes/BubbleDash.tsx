// import _ from 'lodash'
import {FC, useEffect, useMemo, useRef} from 'react'
import Chart from 'chart.js/auto'
import {DashType} from '../../types'
import {DashProps} from '.'
import {map3dMetrics, mapLabels, temporalTypeSet, timeScaleProps} from '../../util/dashboard'

const BubbleDash: FC<DashProps> = ({pageKey, dash, data}) => {
    if (dash.type !== DashType.bubble)
        throw new Error('Illegal dash type')

    const labels = useMemo(() => mapLabels(dash, data), [dash, data])
    const preparedData = useMemo(() => map3dMetrics(dash, data), [dash, data])
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
                }
            }
        })

        return () => { chart.destroy() }
    }, [dash.metricType, dash.name, data, labels, preparedData])

    return (
        <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    )
}

export default BubbleDash