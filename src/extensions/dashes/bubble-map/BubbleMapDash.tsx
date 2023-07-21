import _ from 'lodash'
import {useEffect, useMemo, useRef} from 'react'
import {Alert} from 'antd'
import L from 'leaflet'
import {DashRenderContext} from '../index'
import RulesService from '../../../services/rules'
import {defaultDashColor, defaultDashColors} from '../../../util/bi'
import 'leaflet/dist/leaflet.css'

interface BubbleMapDashOptions {
    latitudeField?: string
    longitudeField?: string
    locationField?: string
    sizeField?: string
    colorField?: string
    rules?: string
}

const rulesService = RulesService.getInstance()

export default function BubbleMapDash({pageKey, fullScreen, dataset, dash, height, data}: DashRenderContext) {
    const {
        latitudeField,
        longitudeField,
        locationField,
        sizeField,
        colorField,
        rules
    } = dash.optValues as BubbleMapDashOptions
    // const [countries, setCountries] = useState([])
    // const labels = useMemo(() => mapLabels(data, colorField), [data, colorField])
    // const preparedData = useMemo(() => map3dMapMetrics(dash, data), [data, dash])
    const fieldRules = useMemo(() => rulesService.parseRules(rules), [rules])
    const seriesData = colorField ? _.uniqBy(data, colorField).map(r => r[colorField]) : []
    const seriesColors = colorField ? rulesService.getSeriesColors(fieldRules, colorField, seriesData, defaultDashColors(seriesData.length)) : []
    const defaultColor = defaultDashColor()
    const mapRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const mapEl = mapRef.current
        if (!mapEl)
            return

        const mapInstance = L.map(mapEl, {attributionControl: false}).setView([56.12, 93.0], 9)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapInstance)

        return () => {
            mapInstance.off()
            mapInstance.remove()
        }
    }, [fullScreen])

    if (!latitudeField)
        return <Alert message="latitudeField attribute not specified" type="error"/>

    if (!longitudeField)
        return <Alert message="longitudeField attribute not specified" type="error"/>

    if (!sizeField)
        return <Alert message="sizeField attribute not specified" type="error"/>

    const {columns} = dataset.spec
    if (!columns || !columns[latitudeField] || !columns[longitudeField] || !columns[sizeField])
        return <Alert message="The dataset does not contain a columns specification" type="error"/>

    return <div ref={mapRef} style={{height: fullScreen ? '85vh' : height}}/>
}