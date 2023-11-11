import {ApiMiddleware, ApiMiddlewareContext, ApiOperation} from './index'
import {ITEM_TEMPLATE_ITEM_NAME, ITEM_TEMPLATE_MODEL_KIND} from '../../config/constants'
import {FlaggedResponse, ItemData, ItemTemplate, ItemTemplateModel} from '../../types'
import axios from 'axios'
import {extractAxiosErrorMessage} from '../../services'
import * as QueryService from '../../services/query'
import appConfig from '../../config'

export const itemTemplateMiddleware: ApiMiddleware = {
    id: 'itemTemplateMiddleware',
    itemName: 'itemTemplate',
    priority: 10,
    handle: handleItemTemplateOperation
}

async function handleItemTemplateOperation(operation: ApiOperation, context: ApiMiddlewareContext, next: () => any) {
    if (context.item.name !== ITEM_TEMPLATE_ITEM_NAME)
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
    let id: string
    try {
        const res = await axios.post('/api/model/apply', mapItemTemplate(values))
        id = res.data
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }

    const data = await QueryService.findById(items, item, id)

    return data.data
}

const mapItemTemplate = (item: ItemTemplate): ItemTemplateModel => ({
    coreVersion: appConfig.coreVersion,
    kind: ITEM_TEMPLATE_MODEL_KIND,
    metadata: {
        name: item.name,
        core: item.core
    },
    spec: item.spec
})

async function remove({items, item, values}: ApiMiddlewareContext): Promise<ItemData> {
    const {id} = values
    const data = await QueryService.findById(items, item, id)
    try {
        await axios.post(`/api/model/delete/itemTemplate/${id}`)
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }

    return data.data
}

async function lock({items, item, values}: ApiMiddlewareContext): Promise<FlaggedResponse> {
    const {id} = values
    try {
        await axios.post(`/api/model/lock/itemTemplate/${id}`)
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }

    const data = await QueryService.findById(items, item, id)

    return {success: true, data: data.data}
}

async function unlock({items, item, values}: ApiMiddlewareContext): Promise<FlaggedResponse> {
    const {id} = values
    try {
        await axios.post(`/api/model/unlock/itemTemplate/${id}`)
    } catch (e: any) {
        throw new Error(extractAxiosErrorMessage(e))
    }

    const data = await QueryService.findById(items, item, id)

    return {success: true, data: data.data}
}