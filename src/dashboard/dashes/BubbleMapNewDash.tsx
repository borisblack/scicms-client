// import _ from 'lodash'
import {FC, useEffect, useState} from 'react'
import Chart from 'chart.js/auto'
import {BubbleMapController, ColorScale, GeoFeature, ProjectionScale, SizeScale} from 'chartjs-chart-geo'
import {DashType} from '../../types'
import {InnerDashProps} from '.'
import {AreaMap, AreaMapConfig} from '@ant-design/charts'

Chart.register(BubbleMapController, GeoFeature, ColorScale, ProjectionScale, SizeScale)

const BubbleMapNewDash: FC<InnerDashProps> = ({dash}) => {
    if (dash.type !== DashType.bubbleMap)
        throw new Error('Illegal dash type')

    const {labelField} = dash
    if (labelField == null)
        throw new Error('Illegal argument')

    // const [countries, setCountries] = useState([])
    // const labels = useMemo(() => mapLabels(data, labelField), [data, labelField])
    // const preparedData = useMemo(() => map3dMapMetrics(dash, data), [data, dash])
    // const canvasRef = useRef<HTMLCanvasElement>(null)
    //
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
    //     if (dash.metricType != null && temporalTypeSet.has(dash.metricType)) {
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
    //
    // return (
    //     <canvas id={`${pageKey}#${dash.name}`} ref={canvasRef}/>
    // )

    const [data, setData] = useState({ type: 'FeatureCollection', features: [] });

    useEffect(() => {
        asyncFetch();
    }, []);

    const asyncFetch = () => {
        fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
            .then((response) => response.json())
            .then((json) => setData(json))
            .catch((error) => {
                console.log('fetch data failed', error);
            });
    };
    const config: AreaMapConfig = {
        // map: {
        //     type: 'mapbox',
        //     style: 'blank',
        //     center: [120.19382669582967, 30.258134],
        //     zoom: 3,
        //     pitch: 0,
        // },
        source: {
            data: data,
            parser: {
                type: 'geojson',
            },
        },
        autoFit: true,
        // color: {
        //     field: 'unit_price',
        //     value: [
        //         '#1A4397',
        //         '#2555B7',
        //         '#3165D1',
        //         '#467BE8',
        //         '#6296FE',
        //         '#7EA6F9',
        //         '#98B7F7',
        //         '#BDD0F8',
        //         '#DDE6F7',
        //         '#F2F5FC',
        //     ].reverse(),
        //     scale: {
        //         type: 'quantile',
        //     },
        // },
        style: {
            opacity: 1,
            stroke: '#fff',
            lineWidth: 0.8,
            lineOpacity: 1,
        },
        state: {
            active: true,
            select: {
                stroke: 'yellow',
                lineWidth: 1.5,
                lineOpacity: 0.8,
            },
        },
        // enabledMultiSelect: true,
        // label: {
        //     visible: true,
        //     field: 'name',
        //     style: {
        //         fill: 'black',
        //         opacity: 0.5,
        //         fontSize: 12,
        //         spacing: 1,
        //         padding: [15, 15],
        //     },
        // },
        // tooltip: {
        //     items: ['name', 'code'],
        // },
        zoom: {
            position: 'bottomright',
        },
        // legend: {
        //     position: 'bottomleft',
        // },
    };

    return <AreaMap {...config} />;
}

export default BubbleMapNewDash