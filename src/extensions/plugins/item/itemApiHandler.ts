import _ from 'lodash'
import axios from 'axios'

import {
  CACHE_TTL_ATTR_NAME,
  CORE_ATTR_NAME,
  DATA_SOURCE_ATTR_NAME,
  DEFAULT_SORT_ATTRIBUTE_ATTR_NAME,
  DEFAULT_SORT_ORDER_ATTR_NAME,
  DESCRIPTION_ATTR_NAME,
  DISPLAY_NAME_ATTR_NAME,
  DISPLAY_PLURAL_NAME_ATTR_NAME,
  ICON_ATTR_NAME,
  IMPLEMENTATION_ATTR_NAME,
  INCLUDE_TEMPLATES_ATTR_NAME,
  ITEM_ITEM_NAME,
  ITEM_MODEL_KIND,
  LIFECYCLE_ATTR_NAME,
  LOCALIZED_ATTR_NAME,
  MAIN_DATASOURCE_NAME,
  MANUAL_VERSIONING_ATTR_NAME,
  NAME_ATTR_NAME,
  NOT_LOCKABLE_ATTR_NAME,
  PERFORM_DDL_ATTR_NAME,
  PERMISSION_ATTR_NAME,
  PLURAL_NAME_ATTR_NAME,
  QUERY_ATTR_NAME,
  READ_ONLY_ATTR_NAME,
  REVISION_POLICY_ATTR_NAME,
  SPEC_ATTR_NAME,
  TABLE_NAME_ATTR_NAME,
  TITLE_ATTRIBUTE_ATTR_NAME,
  VERSIONED_ATTR_NAME
} from 'src/config/constants'
import QueryManager from 'src/services/query'
import {extractAxiosErrorMessage} from 'src/services'
import {FlaggedResponse, ItemData, ItemModel} from 'src/types/schema'
import {ApiMiddlewareContext, ApiOperation} from '../types'

export async function handleItemApiOperation<T extends ItemData>(
  operation: ApiOperation,
  context: ApiMiddlewareContext<T>,
  next: () => any
) {
  if (context.item.name !== ITEM_ITEM_NAME) throw new Error('Illegal argument')

  switch (operation) {
    case ApiOperation.CREATE:
    case ApiOperation.UPDATE:
      return await apply(context)
    case ApiOperation.DELETE:
      return await remove(context)
    case ApiOperation.LOCK:
      return await lock(context)
    case ApiOperation.UNLOCK:
      return await unlock(context)
    case ApiOperation.CREATE_VERSION:
    case ApiOperation.CREATE_LOCALIZATION:
    case ApiOperation.PURGE:
    case ApiOperation.PROMOTE:
    default:
      throw new Error('Unsupported operation')
  }
}

async function apply<T extends ItemData>({items, item, getValue}: ApiMiddlewareContext<T>): Promise<ItemData> {
  const queryManager = new QueryManager(items)
  let id: string
  try {
    const model = toModel(getValue)
    const res = await axios.post('/api/model/apply', model)
    id = res.data
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }

  const data = await queryManager.findById(item, id)

  return data.data
}

function toModel<T extends ItemData>(getValue: (path: keyof T, defaultValue?: any) => any): ItemModel {
  const dataSource = getValue(DATA_SOURCE_ATTR_NAME)
  const revisionPolicy = getValue(REVISION_POLICY_ATTR_NAME)
  const lifecycle = getValue(LIFECYCLE_ATTR_NAME)
  const permission = getValue(PERMISSION_ATTR_NAME)

  return {
    coreVersion: 'v1',
    kind: ITEM_MODEL_KIND,
    includeTemplates: getValue(INCLUDE_TEMPLATES_ATTR_NAME),
    metadata: {
      name: getValue(NAME_ATTR_NAME),
      core: getValue(CORE_ATTR_NAME),
      displayName: getValue(DISPLAY_NAME_ATTR_NAME),
      pluralName: getValue(PLURAL_NAME_ATTR_NAME),
      displayPluralName: getValue(DISPLAY_PLURAL_NAME_ATTR_NAME),
      dataSource: _.isString(dataSource) ? dataSource : dataSource?.data?.id ?? MAIN_DATASOURCE_NAME,
      tableName: getValue(TABLE_NAME_ATTR_NAME),
      query: getValue(QUERY_ATTR_NAME),
      cacheTtl: getValue(CACHE_TTL_ATTR_NAME),
      titleAttribute: getValue(TITLE_ATTRIBUTE_ATTR_NAME),
      defaultSortAttribute: getValue(DEFAULT_SORT_ATTRIBUTE_ATTR_NAME),
      defaultSortOrder: getValue(DEFAULT_SORT_ORDER_ATTR_NAME),
      description: getValue(DESCRIPTION_ATTR_NAME),
      readOnly: getValue(READ_ONLY_ATTR_NAME),
      icon: getValue(ICON_ATTR_NAME),
      performDdl: getValue(PERFORM_DDL_ATTR_NAME),
      versioned: getValue(VERSIONED_ATTR_NAME),
      manualVersioning: getValue(MANUAL_VERSIONING_ATTR_NAME),
      localized: getValue(LOCALIZED_ATTR_NAME),
      revisionPolicy: _.isString(revisionPolicy) ? revisionPolicy : revisionPolicy?.data?.id,
      lifecycle: _.isString(lifecycle) ? lifecycle : lifecycle?.data?.id,
      permission: _.isString(permission) ? permission : permission?.data?.id,
      implementation: getValue(IMPLEMENTATION_ATTR_NAME),
      notLockable: getValue(NOT_LOCKABLE_ATTR_NAME)
    },
    spec: getValue(SPEC_ATTR_NAME, {})
  }
}

async function remove<T extends ItemData>({items, item, getValue}: ApiMiddlewareContext<T>): Promise<ItemData> {
  const queryManager = new QueryManager(items)
  const id: string = getValue(item.idAttribute)
  const data = await queryManager.findById(item, id)
  try {
    await axios.post(`/api/model/delete/item/${id}`)
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }

  return data.data
}

async function lock<T extends ItemData>({items, item, getValue}: ApiMiddlewareContext<T>): Promise<FlaggedResponse> {
  const queryManager = new QueryManager(items)
  const id: string = getValue(item.idAttribute)
  try {
    await axios.post(`/api/model/lock/item/${id}`)
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }

  const data = await queryManager.findById(item, id)

  return {success: true, data: data.data}
}

async function unlock<T extends ItemData>({items, item, getValue}: ApiMiddlewareContext<T>): Promise<FlaggedResponse> {
  const queryManager = new QueryManager(items)
  const id: string = getValue(item.idAttribute)
  try {
    await axios.post(`/api/model/unlock/item/${id}`)
  } catch (e: any) {
    throw new Error(extractAxiosErrorMessage(e))
  }

  const data = await queryManager.findById(item, id)

  return {success: true, data: data.data}
}
