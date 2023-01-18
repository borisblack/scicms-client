// import _ from 'lodash'
import {FC, useEffect, useMemo, useRef, useState} from 'react'
import Chart from 'chart.js/auto'
import {BubbleMapController, ColorScale, GeoFeature, ProjectionScale, SizeScale, topojson} from 'chartjs-chart-geo'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import {map3dMapMetrics, mapLabels, temporalTypeSet, timeScaleProps} from '../../util/dashboard'

Chart.register(BubbleMapController, GeoFeature, ColorScale, ProjectionScale, SizeScale)

const BubbleMapDash: FC<InnerDashProps> = ({pageKey, fullScreen, dash, dataset, data}) => {
    if (dash.type !== DashType.bubbleMap)
        throw new Error('Illegal dash type')

    const [countries, setCountries] = useState([])
    const labels = useMemo(() => mapLabels(data, dash.labelField), [dash.labelField, data])
    const preparedData = useMemo(() => map3dMapMetrics(dataset, data), [data, dataset])
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

        if (temporalTypeSet.has(dataset.metricType)) {
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
                },
                maintainAspectRatio: !fullScreen
            }
        })

        return () => { chart.destroy() }
    }, [countries, dash.name, dataset.metricType, fullScreen, labels, preparedData])

    return (
        <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    )
}

export default BubbleMapDash