import _ from 'lodash'
import {FC, useEffect, useMemo, useRef} from 'react'
import Chart from 'chart.js/auto'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import {map2dMetrics, mapLabels, temporalTypeSet, timeScaleProps} from '../../util/dashboard'

const LineDash: FC<InnerDashProps> = ({pageKey, dash, fullScreen, dataset, data}) => {
    if (dash.type !== DashType.line)
        throw new Error('Illegal dash type')

    const labels = useMemo(() => mapLabels(data, dash.labelField), [dash.labelField, data])
    const preparedData = useMemo(() => map2dMetrics(dataset, data), [data, dataset])
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        const scales: any = {
            x: {
                ...timeScaleProps,
                min: _.min(preparedData.map(it => it.x.toJSDate()))?.toISOString(),
                max: _.max(preparedData.map(it => it.x.toJSDate()))?.toISOString()
            }
        }

        if (temporalTypeSet.has(dataset.metricType)) {
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
                // plugins: {
                //     tooltip: {
                //         callbacks: {
                //             label: context => {
                //                 const {label, dataIndex} = context
                //                 return ` ${label}: ${labels[dataIndex]}`
                //             }
                //         }
                //     }
                // },
                maintainAspectRatio: !fullScreen
            }
        })

        return () => { chart.destroy() }
    }, [dash.name, dataset.metricType, fullScreen, labels, preparedData])

    return (
        <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    )
}

export default LineDash