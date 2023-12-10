import axios from 'axios'

import {ApiMiddleware, ApiMiddlewareContext, ApiOperation} from './index'
import {ITEM_ITEM_NAME, ITEM_MODEL_KIND, MAIN_DATASOURCE_NAME} from '../../config/constants'
import QueryManager from '../../services/query'
import {extractAxiosErrorMessage} from '../../services'
import {FlaggedResponse, Item, ItemData, ItemModel} from '../../types'
import appConfig from '../../config'

export const itemMiddleware: ApiMiddleware = {
    id: 'itemMiddleware',
    itemName: 'item',
    priority: 10,
    handle: handleItemOperation
}

async function handleItemOperation(operation: ApiOperation, context: ApiMiddlewareContext, next: () => any) {
    if (context.item.name !== ITEM_ITEM_NAME)
        throw new Error('Illegal argument')

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

async function apply({items, item, values}: ApiMiddlewareContext): Promise<ItemData> {
    const queryManager = new QueryManager(items)
    let id: string
    try {
        const res = await axios.post('/api/model/apply', mapItem(values))
        id = res.data
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }

    const data = await queryManager.findById(item, id)

    return data.data
}

const mapItem = (item: Item): ItemModel => ({
    coreVersion: appConfig.coreVersion,
    kind: ITEM_MODEL_KIND,
    includeTemplates: item.includeTemplates,
    metadata: {
        name: item.name,
        core: item.core,
        displayName: item.displayName,
        pluralName: item.pluralName,
        displayPluralName: item.displayPluralName,
        dataSource: item.datasource.data?.id ?? MAIN_DATASOURCE_NAME,
        tableName: item.tableName,
        query: item.query,
        cacheTtl: item.cacheTtl,
        titleAttribute: item.titleAttribute,
        description: item.description,
        readonly: item.readOnly,
        icon: item.icon,
        performDdl: item.performDdl,
        versioned: item.versioned,
        manualVersioning: item.manualVersioning,
        localized: item.localized,
        revisionPolicy: item.revisionPolicy?.data?.id,
        lifecycle: item.lifecycle?.data?.id,
        permission: item.permission?.data?.id,
        implementation: item.implementation,
        notLockable: item.notLockable
    },
    spec: item.spec
})

async function remove({items, item, values}: ApiMiddlewareContext): Promise<ItemData> {
    const queryManager = new QueryManager(items)
    const {id} = values
    const data = await queryManager.findById(item, id)
    try {
        await axios.post(`/api/model/delete/item/${id}`)
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }

    return data.data
}

async function lock({items, item, values}: ApiMiddlewareContext): Promise<FlaggedResponse> {
    const queryManager = new QueryManager(items)
    const {id} = values
    try {
        await axios.post(`/api/model/lock/item/${id}`)
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }

    const data = await queryManager.findById(item, id)

    return {success: true, data: data.data}
}

async function unlock({items, item, values}: ApiMiddlewareContext): Promise<FlaggedResponse> {
    const queryManager = new QueryManager(items)
    const {id} = values
    try {
        await axios.post(`/api/model/unlock/item/${id}`)
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }

    const data = await queryManager.findById(item, id)

    return {success: true, data: data.data}
}