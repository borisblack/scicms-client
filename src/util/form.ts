import {Attribute, AttrType, Item, ItemData, Location} from '../types'
import MediaService from '../services/media'
import LocationService from '../services/location'

const mediaService = MediaService.getInstance()
const locationService = LocationService.getInstance()

export async function parseValues(item: Item, data: ItemData | undefined, values: any): Promise<{[name: string]: any}> {
    const parsedValues: {[name: string]: any} = {}
    const {attributes} = item.spec

    for (const key in values) {
        if (!values.hasOwnProperty(key) || !attributes.hasOwnProperty(key))
            continue

        const attribute = attributes[key]
        parsedValues[key] = await parseValue(key, attribute, data, values)
    }

    return parsedValues
}

async function parseValue(attrName: string, attribute: Attribute, data: ItemData | undefined, values: any): Promise<any> {
    const value = values[attrName]
    switch (attribute.type) {
        case AttrType.media:
            const mediaId = values[`${attrName}.id`]
            if (!mediaId) {
                const fileList = value as File[]
                const mediaInfo = await mediaService.upload(fileList[0])
                return mediaInfo.id
            }
            return mediaId
        case AttrType.location:
            const locationId = values[attrName]
            const latitude = values[`${attrName}.latitude`]
            const longitude = values[`${attrName}.longitude`]
            const label = values[`${attrName}.label`]
            if (locationId) {
                const prevLocation: Location | null = data ? data[attrName].data as Location : null
                if (prevLocation) {
                    if (prevLocation.latitude !== latitude || prevLocation.longitude !== longitude || prevLocation.label !== label) {
                        await locationService.update(locationId, latitude, longitude, label)
                    }
                }
                return locationId
            } else {
                const location = await locationService.create(latitude, longitude, label)
                return location.id
            }
        case AttrType.relation:
            return values[`${attrName}.id`]
        default:
            return value
    }
}