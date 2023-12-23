import _ from 'lodash'
import {memo, useCallback, useEffect, useMemo, useRef} from 'react'
import {Alert} from 'antd'
import {v4 as uuidv4} from 'uuid'
import L, {LatLngExpression} from 'leaflet'
import {DashRenderContext} from '../index'
import * as RulesService from 'src/services/rules'
import {defaultDashColor, defaultDashColors} from 'src/util/bi'
import biConfig from 'src/config/bi'
import {MAX_LAT, MAX_LNG, MIN_LAT, MIN_LNG} from '.'
import {QueryFilter, QueryOp} from 'src/types'
import 'leaflet/dist/leaflet.css'

interface BubbleMapDashOptions {
    latitudeField?: string
    longitudeField?: string
    sizeField?: string
    colorField?: string
    labelField?: string
    centerLatitude?: number
    centerLongitude?: number
    defaultZoom?: number
    rules?: string
}

const mapConfig = biConfig.dash.map
const defaultColor = defaultDashColor()

function BubbleMapDash({pageKey, fullScreen, dataset, dash, height, data, onRelatedDashboardOpen}: DashRenderContext) {
    const {columns} = dataset.spec
    const {relatedDashboardId} = dash
    const {
        latitudeField,
        longitudeField,
        sizeField,
        colorField,
        labelField,
        centerLatitude,
        centerLongitude,
        defaultZoom,
        rules
    } = dash.optValues as BubbleMapDashOptions
    const fieldRules = useMemo(() => RulesService.parseRules(rules), [rules])
    const seriesData = useMemo(() => colorField ? _.uniqBy(data, colorField) : [], [colorField, data])
    const seriesColors = useMemo(() => colorField ? RulesService.getSeriesColors(fieldRules, colorField, seriesData, defaultDashColors(seriesData.length)) : [], [colorField, fieldRules, seriesData])
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<L.Map | null>(null)

    useEffect(() => {
        const mapEl = mapRef.current
        if (!mapEl)
            return

        const centerPosition: LatLngExpression | undefined = ((centerLatitude == null && mapConfig.centerPosition?.latitude == null) || (centerLongitude == null && mapConfig.centerPosition?.longitude == null)) ?
            undefined :
            [centerLatitude ?? mapConfig.centerPosition?.latitude, centerLongitude ?? mapConfig.centerPosition?.longitude] as LatLngExpression
        mapInstance.current = L.map(mapEl, {
            attributionControl: false,
            center: centerPosition,
            zoom: defaultZoom ?? mapConfig.defaultZoom
        })
        L.tileLayer(mapConfig.urlTemplate, {
            maxZoom: mapConfig.maxZoom,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapInstance.current)

        return () => {
            mapInstance.current?.off()
            mapInstance.current?.remove()
        }
    }, [centerLatitude, centerLongitude, defaultZoom, fullScreen])

    const renderTitle = useCallback((label: any, size: any) => {
        const labelCol = labelField ? columns[labelField] : null
        const sizeCol = sizeField ? columns[sizeField] : null
        return `${labelCol ? `<div><b>${labelCol.alias || labelField}:</b> ${label}</div>` : ''}${sizeCol ? `<div><b>${sizeCol.alias || sizeField}:</b> ${size}</div>` : ''}`
    }, [columns, labelField, sizeField])

    useEffect(() => {
        if (mapInstance.current == null || latitudeField == null || longitudeField == null || sizeField == null)
            return

        const bubbles: L.Circle[] = []
        data
            .filter(row => {
                const lat = row[latitudeField]
                const lng = row[longitudeField]
                return lat != null && lat >= MIN_LAT && lat <= MAX_LAT && lng != null && lng >= MIN_LNG && lng <= MAX_LNG
            })
            .forEach((row, i) => {
                const color = colorField ? seriesColors ? seriesColors[i] : defaultColor : defaultColor
                const size = row[sizeField]
                const bubble = L.circle([row[latitudeField], row[longitudeField]], {
                    color,
                    fillColor: color,
                    fillOpacity: 0.5,
                    radius: size ?? mapConfig.defaultSize
                }).addTo(mapInstance.current as L.Map)

                const label = labelField ? row[labelField] : null
                bubble.bindPopup(renderTitle(label, size))

                if (relatedDashboardId && size != null) {
                    bubble.on('click', evt => {
                        handleBubbleClick(evt, sizeField, size, queryFilter => onRelatedDashboardOpen(relatedDashboardId, queryFilter))
                    })
                }

                bubbles.push(bubble)
            })

        return () => {
            bubbles.forEach(bubble => {
                bubble.off('click')
                bubble.remove()
            })
        }
    }, [data, latitudeField, longitudeField, colorField, sizeField, labelField, seriesColors, relatedDashboardId, onRelatedDashboardOpen, renderTitle])

    function handleBubbleClick(evt: L.LeafletMouseEvent, fieldName: string, value: any, cb: (queryFilter: QueryFilter) => void) {
        if (evt.type !== 'click' || value == null)
            return

        cb({
            id: uuidv4(),
            columnName: fieldName,
            op: QueryOp.$eq,
            value
        })
    }

    if (!latitudeField)
        return <Alert message="latitudeField attribute not specified" type="error"/>

    if (!longitudeField)
        return <Alert message="longitudeField attribute not specified" type="error"/>

    if (!sizeField)
        return <Alert message="sizeField attribute not specified" type="error"/>

    if (!columns || !columns[latitudeField] || !columns[longitudeField] || !columns[sizeField] || (labelField && !columns[labelField]))
        return <Alert message="The dataset does not contain a columns specification" type="error"/>

    return (
        <div
            key={relatedDashboardId}
            ref={mapRef}
            style={{height: fullScreen ? '88vh' : height, width: fullScreen ? '98vw' : undefined}}
        />
    )
}

export default memo(BubbleMapDash)