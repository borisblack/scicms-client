// import _ from 'lodash'
import {FC, useEffect, useMemo, useRef} from 'react'
import Chart from 'chart.js/auto'
import {ChoroplethController, GeoFeature, ColorScale, ProjectionScale, SizeScale} from 'chartjs-chart-geo'
import {DashType} from '../../types'
import {DashProps} from '.'
import {map3dMapMetrics, mapLabels, temporalTypeSet, timeScaleProps} from '../../util/dashboard'

Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale, SizeScale)

const BubbleMapDash: FC<DashProps> = ({pageKey, dash, data}) => {
    if (dash.type !== DashType.bubbleMap)
        throw new Error('Illegal dash type')

    const labels = useMemo(() => mapLabels(dash, data), [dash, data])
    const preparedData = useMemo(() => map3dMapMetrics(dash, data), [dash, data])
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
            type: DashType.bubbleMap,
            data: {
                labels,
                datasets: [{
                    label: dash.name,
                    data: preparedData,
                    backgroundColor: 'rgb(255, 99, 132)'
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

export default BubbleMapDash