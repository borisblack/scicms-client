import {Attribute, AttrType, Item, ItemData, Location} from '../types'
import MediaService from '../services/media'
import LocationService from '../services/location'
import {MINOR_REV_ATTR_NAME, MOMENT_ISO_DATE_FORMAT_STRING, MOMENT_ISO_TIME_FORMAT_STRING} from '../config/constants'
import {Moment} from 'moment'

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
        if (attribute.keyed || attribute.readOnly || attribute.type === AttrType.sequence)
            continue

        parsedValues[key] = await parseValue(item, key, attribute, data, values)
    }

    return parsedValues as ItemData
}

async function parseValue(
    item: Item,
    attrName: string,
    attribute: Attribute,
    data: ItemData | undefined,
    values: any
): Promise<any> {
    const value = values[attrName]
    const prevItemPermissionId = data?.permission.data?.id
    const itemPermissionId = values['permission.id']
    switch (attribute.type) {
        case AttrType.date:
            return value ? (value as Moment).format(MOMENT_ISO_DATE_FORMAT_STRING) : null
        case AttrType.time:
            return value ? `${(value as Moment).format(MOMENT_ISO_TIME_FORMAT_STRING)}Z` : null
        case AttrType.media:
            const mediaId = values[`${attrName}.id`]
            if (mediaId) {
                if (itemPermissionId !== prevItemPermissionId) {
                    await mediaService.update(mediaId, {permission: itemPermissionId})
                }
            } else {
                const fileList = (value as File[] | undefined) ?? []
                if (fileList.length > 0) {
                    const mediaInfo = await mediaService.uploadData({file: fileList[0], permission: itemPermissionId})
                    return mediaInfo.id
                }
            }
            return mediaId
        case AttrType.location:
            const locationData = data ? data[attrName].data as Location : null
            const {latitude, longitude, label} = value
            const isEmpty = !latitude && !longitude && !label
            if (locationData) {
                if (isEmpty) {
                    // Can be used by another versions or localizations
                    if (!item.versioned && !item.localized)
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
                if (isEmpty) {
                    return null
                } else {
                    const location = await locationService.create({latitude, longitude, label, permission: itemPermissionId})
                    return location.id
                }
            }
        case AttrType.relation:
            return values[`${attrName}.id`]
        default:
            return value
    }
}

export function filterValues(values: FilteredItemData): ItemData {
    const filteredValues = {...values}

    delete filteredValues.majorRev
    delete filteredValues.locale
    delete filteredValues.state

    return filteredValues as ItemData
}