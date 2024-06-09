import _ from 'lodash'
import {Dayjs} from 'dayjs'
import {DateTime} from 'luxon'

import {FieldType} from '../types'
import {Attribute, Item, ItemData} from '../types/schema'
import * as MediaService from '../services/media'
import {
  LETTER_NO_WHITESPACE_MESSAGE,
  LETTER_NO_WHITESPACE_PATTERN,
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

interface FilteredItemData {
    majorRev?: string
    locale?: string | null
    state?: string | null
}

const regExpMessages: Record<string, string> = {
  [LETTER_NO_WHITESPACE_PATTERN.toString()]: LETTER_NO_WHITESPACE_MESSAGE,
  [LOWERCASE_NO_WHITESPACE_PATTERN.toString()]: LOWERCASE_NO_WHITESPACE_MESSAGE
}

export async function parseValues(item: Item, data: ItemData | null | undefined, values: any): Promise<ItemData> {
  const hiddenFields = Object.entries(item.spec.attributes)
    .filter(([attrName, attr]) => attr.fieldHidden && !attr.readOnly)
    .map(([attrName, attr]) => attrName)
  const parsedValues: {[name: string]: any} = data ? _.pick(data, hiddenFields) : {}
  const {attributes} = item.spec

  for (const key in values) {
    if (!values.hasOwnProperty(key) || !attributes.hasOwnProperty(key))
      continue

    if (!item.versioned && key === MINOR_REV_ATTR_NAME)
      continue

    const attribute = attributes[key]
    if (attribute.keyed || attribute.readOnly || attribute.type === FieldType.sequence)
      continue

    const value = values[key]
    if (attribute.type === FieldType.password && value === PASSWORD_PLACEHOLDER)
      continue

    if (attribute.type === FieldType.string && key === STATE_ATTR_NAME)
      continue

    if (value === undefined && attribute.type !== FieldType.media)
      continue

    parsedValues[key] = await parseValue(item, key, attribute, data, values)
  }

  return parsedValues as ItemData
}

async function parseValue(item: Item, attrName: string, attribute: Attribute, data: ItemData | null | undefined, values: any): Promise<any> {
  const value = values[attrName]
  switch (attribute.type) {
    case FieldType.date:
      return value ? DateTime.fromISO((value as Dayjs).toISOString()).toISODate() : null
    case FieldType.time:
      return parseTime(attrName, values)
    case FieldType.datetime:
      return parseDateTime(attrName, values)
    case FieldType.media:
      return await parseMedia(attrName, data, values)
    case FieldType.array:
      return _.isString(value) ? value.split('\n').map(it => tryParseJson(it)) : value
    case FieldType.json:
      return _.isString(value) ? JSON.parse(value) : value
    case FieldType.relation:
      return values[`${attrName}.${attribute.referencedBy || item.idAttribute}`]
    default:
      return value
  }
}

function parseTime(attrName: string, values: any): string | null {
  const value = values[attrName]
  if (!value)
    return null

  const isChanged = values[`${attrName}.changed`]
  const iso = (value as Dayjs).toISOString()
  const dt = isChanged ? DateTime.fromISO(iso) : DateTime.fromISO(iso, {zone: UTC})
  return dt.toISOTime()
}

function parseDateTime(attrName: string, values: any): string | null {
  const value = values[attrName]
  if (!value)
    return null

  const isChanged = values[`${attrName}.changed`]
  const iso = (value as Dayjs).toISOString()
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
      await MediaService.update(mediaId, {permission: itemPermissionId})
    }
    return mediaId
  } else {
    const fileList = (value as File[] | undefined) ?? []
    if (fileList.length > 0) {
      const mediaInfo = await MediaService.uploadData({file: fileList[0], permission: itemPermissionId})
      return mediaInfo.id
    }
    return null
  }
}

export function filterValues(values: FilteredItemData): ItemData {
  const filteredValues = {...values}

  delete filteredValues.majorRev
  delete filteredValues.locale

  return filteredValues as ItemData
}

export const requiredFieldRule = (message?: string) => ({
  required: true,
  message: i18n.t(message ?? 'Required field')
})

export const regExpRule = (regExp: RegExp, message?: string): FormRule => () => ({
  validator(_, value) {
    if (value == null || value.match(regExp))
      return Promise.resolve()

    const msg = message ?? regExpMessages[regExp.toString()]
    return Promise.reject(new Error(msg == null ? util.format(i18n.t('String does not match pattern %s'), regExp) : i18n.t(msg)))
  }})
