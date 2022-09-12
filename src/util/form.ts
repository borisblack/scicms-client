import _ from 'lodash'
import {Moment} from 'moment'
import {DateTime} from 'luxon'

import {Attribute, AttrType, Item, ItemData, Location} from '../types'
import MediaService from '../services/media'
import LocationService from '../services/location'
import {
    LOWERCASE_NO_WHITESPACE_MESSAGE,
    LOWERCASE_NO_WHITESPACE_PATTERN,
    MINOR_REV_ATTR_NAME,
    PASSWORD_PLACEHOLDER,
    STATE_ATTR_NAME,
    UTC
} from '../config/constants'
import appConfig from '../config'
import {tryParseJson} from './index'
import {FormRule} from 'antd'
import util from 'util'
import i18n from '../i18n'

const {timeZone} = appConfig.dateTime
const mediaService = MediaService.getInstance()
const locationService = LocationService.getInstance()

interface FilteredItemData {
    majorRev?: string
    locale?: string | null
    state?: string | null
}

export async function parseValues(item: Item, data: ItemData | null | undefined, values: any): Promise<ItemData> {
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

        const value = values[key]
        if (attribute.type === AttrType.password && value === PASSWORD_PLACEHOLDER)
            continue

        if (attribute.type === AttrType.string && key === STATE_ATTR_NAME)
            continue

        if (value === undefined && attribute.type !== AttrType.media && attribute.type !== AttrType.location)
            continue

        parsedValues[key] = await parseValue(item, key, attribute, data, values)
    }

    return parsedValues as ItemData
}

async function parseValue(item: Item, attrName: string, attribute: Attribute, data: ItemData | null | undefined, values: any): Promise<any> {
    const value = values[attrName]
    switch (attribute.type) {
        case AttrType.date:
            return value ? DateTime.fromISO((value as Moment).toISOString()).toISODate() : null
        case AttrType.time:
            return parseTime(attrName, values)
        case AttrType.datetime:
            return parseDateTime(attrName, values)
        case AttrType.media:
            return await parseMedia(attrName, data, values)
        case AttrType.location:
            return await parseLocation(item, attrName, data, values)
        case AttrType.array:
            return _.isString(value) ? value.split('\n').map(it => tryParseJson(it)) : value
        case AttrType.json:
            return _.isString(value) ? JSON.parse(value) : value
        case AttrType.relation:
            return values[`${attrName}.id`]
        default:
            return value
    }
}

function parseTime(attrName: string, values: any): string | null {
    const value = values[attrName]
    if (!value)
        return null

    const isChanged = values[`${attrName}.changed`]
    const iso = (value as Moment).toISOString()
    const dt = isChanged ? DateTime.fromISO(iso) : DateTime.fromISO(iso, {zone: UTC})
    return dt.toISOTime()
}

function parseDateTime(attrName: string, values: any): string | null {
    const value = values[attrName]
    if (!value)
        return null

    const isChanged = values[`${attrName}.changed`]
    const iso = (value as Moment).toISOString()
    const dt = isChanged ? DateTime.fromISO(iso) : DateTime.fromISO(iso, {zone: UTC})
    return dt.setZone(timeZone, {keepLocalTime: true}).toISO()
}

async function parseMedia(attrName: string, data: ItemData | null | undefined, values: any): Promise<string | null> {
    const value = values[attrName]
    const prevItemPermissionId = data?.permission?.data?.id
    const itemPermissionId = values['permission.id']
    const mediaId = values[`${attrName}.id`]
    if (mediaId) {
        if (itemPermissionId !== prevItemPermissionId) {
            await mediaService.update(mediaId, {permission: itemPermissionId})
        }
        return mediaId
    } else {
        const fileList = (value as File[] | undefined) ?? []
        if (fileList.length > 0) {
            const mediaInfo = await mediaService.uploadData({file: fileList[0], permission: itemPermissionId})
            return mediaInfo.id
        }
        return null
    }
}

async function parseLocation(item: Item, attrName: string, data: ItemData | null | undefined, values: any): Promise<string | null> {
    const value = values[attrName]
    const prevItemPermissionId = data?.permission?.data?.id
    const itemPermissionId = values['permission.id']
    const locationData = data ? data[attrName]?.data as Location : null
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
}

export function filterValues(values: FilteredItemData): ItemData {
    const filteredValues = {...values}

    delete filteredValues.majorRev
    delete filteredValues.locale

    return filteredValues as ItemData
}

export const regExpRule = (regExp: RegExp, message?: string): FormRule => () => ({
    validator(_, value) {
        if (value == null || value.match(regExp))
            return Promise.resolve()

        const msg = message ? message : (regExp.toString() === LOWERCASE_NO_WHITESPACE_PATTERN.toString() ? LOWERCASE_NO_WHITESPACE_MESSAGE : null)
        return Promise.reject(new Error(msg ? i18n.t(msg) : util.format(i18n.t('String does not match pattern %s'), regExp)))
    }})