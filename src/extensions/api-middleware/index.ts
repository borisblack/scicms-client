import {IBuffer, UserInfo} from 'src/types'
import {Item} from 'src/types/schema'
import _ from 'lodash'
import apiMiddlewareConfig from 'src/config/api-middleware'
import {ItemMap} from 'src/services/item'

export enum ApiOperation {
    FIND = 'FIND',
    FIND_ALL = 'FIND_ALL',
    CREATE = 'CREATE',
    CREATE_VERSION = 'CREATE_VERSION',
    CREATE_LOCALIZATION = 'CREATE_LOCALIZATION',
    UPDATE = 'UPDATE',
    LOCK = 'LOCK',
    UNLOCK = 'UNLOCK',
    DELETE = 'DELETE',
    PURGE = 'PURGE',
    PROMOTE = 'PROMOTE',
}

export interface ApiMiddleware {
    id: string
    itemName: string | '*'
    priority: number
    handle: (operation: ApiOperation, context: ApiMiddlewareContext, next: () => any) => any
}

export interface ApiMiddlewareContext {
    me: UserInfo | null
    items: ItemMap
    item: Item
    buffer: IBuffer
    values: any
}

const apiMiddleware: ApiMiddleware[] = apiMiddlewareConfig.apiMiddleware.sort((a, b) => a.priority - b.priority)

const apiMiddlewareByItemName: {[itemName: string]: ApiMiddleware[]} = _.groupBy(apiMiddleware, it => it.itemName)

export const hasApiMiddleware = (itemName: string): boolean => itemName in apiMiddlewareByItemName || '*' in apiMiddlewareByItemName

export async function handleApiMiddleware(itemName: string, operation: ApiOperation, context: ApiMiddlewareContext, next: () => any): Promise<any> {
    const apiMiddlewareList = [...(apiMiddlewareByItemName[itemName] ?? []), ...(apiMiddlewareByItemName['*'] ?? [])]
    if (apiMiddlewareList.length === 0)
        return await next()

    return await handleApiMiddlewareList(apiMiddlewareList, operation, context, next)
}

async function handleApiMiddlewareList(list: ApiMiddleware[], operation: ApiOperation, context: ApiMiddlewareContext, next: () => any): Promise<any> {
    if (list.length === 0)
        return await next()

    const first = list[0]
    return await first.handle(operation, context, () => handleApiMiddlewareList(list.slice(1), operation, context, next))
}