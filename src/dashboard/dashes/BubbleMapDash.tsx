// import _ from 'lodash'
import {FC, useEffect, useMemo, useRef, useState} from 'react'
import Chart from 'chart.js/auto'
import {BubbleMapController, ColorScale, GeoFeature, ProjectionScale, SizeScale, topojson} from 'chartjs-chart-geo'
import {DashType} from '../../types'
import {DashProps} from '.'
import {map3dMapMetrics, mapLabels, temporalTypeSet, timeScaleProps} from '../../util/dashboard'

Chart.register(BubbleMapController, GeoFeature, ColorScale, ProjectionScale, SizeScale)

const BubbleMapDash: FC<DashProps> = ({pageKey, dash, data}) => {
    if (dash.type !== DashType.bubbleMap)
        throw new Error('Illegal dash type')

    const [countries, setCountries] = useState([])
    const labels = useMemo(() => mapLabels(dash, data), [dash, data])
    const preparedData = useMemo(() => map3dMapMetrics(dash, data), [dash, data])
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        fetch('/countries-50m.json')
            .then((r) => r.json())
            .then((countriesData) => {
                const parsedCountries = (topojson.feature(countriesData, countriesData.objects.countries) as any).features
                setCountries(parsedCountries)
            })
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        const scales: any = {}

        if (temporalTypeSet.has(dash.metricType)) {
            scales.r = {
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
                    outline: countries,
                    showOutline: true,
                    backgroundColor: 'steelblue',
                    data: preparedData
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    ...scales,
                    xy: {
                        projection: 'equalEarth',
                    },
                    // r: {
                    //     size: [1, 20],
                    // }
                }
            }
        })

        return () => { chart.destroy() }
    }, [countries, dash.metricType, dash.name, data, labels, preparedData])

    return (
        <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    )
}

export default BubbleMapDash