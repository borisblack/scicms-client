import _ from 'lodash'
import {DashRenderContext} from '../index'
import {useMemo, useRef} from 'react'
import {Alert} from 'antd'
import {BubbleMapController, ColorScale, GeoFeature, ProjectionScale, SizeScale} from 'chartjs-chart-geo'
import Chart from 'chart.js/auto'
import {LegendPosition} from '../util'
import RulesService from '../../../services/rules'
import {defaultDashColor, defaultDashColors} from '../../../util/bi'

interface BubbleMapDashOptions {
    latitudeField?: string
    longitudeField?: string
    locationField?: string
    sizeField?: string
    colorField?: string
    legendPosition?: LegendPosition
    hideLegend?: boolean
    xAxisLabelAutoRotate?: boolean
    rules?: string
}

Chart.register(BubbleMapController, GeoFeature, ColorScale, ProjectionScale, SizeScale)

const rulesService = RulesService.getInstance()

export default function BubbleMapDash({pageKey, fullScreen, dataset, dash, data}: DashRenderContext) {
    const {
        latitudeField,
        longitudeField,
        locationField,
        sizeField,
        colorField,
        hideLegend,
        legendPosition,
        xAxisLabelAutoRotate,
        rules
    } = dash.optValues as BubbleMapDashOptions
    // const [countries, setCountries] = useState([])
    // const labels = useMemo(() => mapLabels(data, colorField), [data, colorField])
    // const preparedData = useMemo(() => map3dMapMetrics(dash, data), [data, dash])
    const fieldRules = useMemo(() => rulesService.parseRules(rules), [rules])
    const seriesData = colorField ? _.uniqBy(data, colorField).map(r => r[colorField]) : []
    const seriesColors = colorField ? rulesService.getSeriesColors(fieldRules, colorField, seriesData, defaultDashColors()) : []
    const defaultColor = defaultDashColor()
    const canvasRef = useRef<HTMLCanvasElement>(null)

    if (!latitudeField)
        return <Alert message="latitudeField attribute not specified" type="error"/>

    if (!longitudeField)
        return <Alert message="longitudeField attribute not specified" type="error"/>

    if (!sizeField)
        return <Alert message="sizeField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    if (!columns || !columns[latitudeField] || !columns[longitudeField] || !columns[sizeField])
        return <Alert message="The dataset does not contain a columns specification" type="error"/>

    // useEffect(() => {
    //     fetch('/countries-50m.json')
    //         .then((r) => r.json())
    //         .then((countriesData) => {
    //             const parsedCountries = (topojson.feature(countriesData, countriesData.objects.countries) as any).features
    //             setCountries(parsedCountries)
    //         })
    // }, [])
    //
    // useEffect(() => {
    //     const canvas = canvasRef.current
    //     if (!canvas)
    //         return
    //
    //     const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    //     const scales: any = {}
    //
    //     if (dash.metricType != null && isTemporal(dash.metricType)) {
    //         scales.r = {
    //             ...timeScaleProps,
    //             // min: _.min(preparedData.map(it => it.y))?.toISOString()
    //         }
    //     }
    //
    //     const chart = new Chart(ctx, {
    //         type: DashType.bubbleMap,
    //         data: {
    //             labels,
    //             datasets: [{
    //                 label: dash.name,
    //                 outline: countries,
    //                 showOutline: true,
    //                 backgroundColor: 'steelblue',
    //                 data: preparedData
    //             }]
    //         },
    //         options: {
    //             plugins: {
    //                 legend: {
    //                     display: false
    //                 }
    //             },
    //             scales: {
    //                 ...scales,
    //                 xy: {
    //                     projection: 'equalEarth',
    //                 },
    //                 // r: {
    //                 //     size: [1, 20],
    //                 // }
    //             },
    //             maintainAspectRatio: !fullScreen
    //         }
    //     })
    //
    //     return () => { chart.destroy() }
    // }, [countries, dash.metricType, dash.name, fullScreen, labels, preparedData])

    return <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
}