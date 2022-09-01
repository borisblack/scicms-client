import {Attribute, AttrType, Item, ItemData, Location} from '../types'
import MediaService from '../services/media'
import LocationService, {LocationInput} from '../services/location'

const MINOR_REV_ATTR_NAME = 'minorRev'

const mediaService = MediaService.getInstance()
const locationService = LocationService.getInstance()

interface FilteredItemData {
    majorRev?: string
    locale?: string | null
    state?: string | null
}

export async function parseValues(item: Item, data: ItemData | undefined, values: any): Promise<ItemData> {
    const parsedValues: {[name: string]: any} = {}
    const {attributes} = item.spec

    for (const key in values) {
        if (!values.hasOwnProperty(key) || !attributes.hasOwnProperty(key))
            continue

        if (!item.versioned && key === MINOR_REV_ATTR_NAME)
            continue

        const attribute = attributes[key]
        if (attribute.keyed || attribute.readOnly)
            continue

        parsedValues[key] = await parseValue(key, attribute, data, values)
    }

    return parsedValues as ItemData
}

async function parseValue(attrName: string, attribute: Attribute, data: ItemData | undefined, values: any): Promise<any> {
    const value = values[attrName]
    const prevItemPermissionId = data?.permission.data?.id
    const itemPermissionId = values['permission.id']
    switch (attribute.type) {
        case AttrType.media:
            const mediaId = values[`${attrName}.id`]
            if (mediaId) {
                if (itemPermissionId !== prevItemPermissionId) {
                    await mediaService.update(mediaId, {permission: itemPermissionId})
                }
            } else {
                const fileList = value as File[]
                if (fileList.length > 0) {
                    const mediaInfo = await mediaService.uploadData({file: fileList[0], permission: itemPermissionId})
                    return mediaInfo.id
                }
            }
            return mediaId
        case AttrType.location:
            const locationData = data ? data[attrName].data as Location : null
            const {latitude, longitude, label} = value
            if (locationData) {
                const isDeleted = !latitude && !longitude && !label
                if (isDeleted) {
                    await locationService.delete(locationData.id)
                    return null
                } else {
                    const isChanged = latitude !== locationData.latitude || longitude !== locationData.longitude || label !== locationData.label || itemPermissionId !== prevItemPermissionId
                    if (isChanged) {
                        await locationService.update(locationData.id, {latitude, longitude, label, permission: itemPermissionId})
                    }
                    return locationData.id
                }
            } else {
                const input: LocationInput = {latitude, longitude, label, permission: itemPermissionId}
                const location = await locationService.create(input)
                return location.id
            }
        case AttrType.relation:
            return values[`${attrName}.id`]
        default:
            return value
    }
}

export function filterValues(values: FilteredItemData) {
    delete values.majorRev
    delete values.locale
    delete values.state
}